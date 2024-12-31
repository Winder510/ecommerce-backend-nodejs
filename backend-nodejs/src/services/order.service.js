import CheckOutService from './checkout.service.js';
import {
    acquireLock,
    acquireLockV2,
    releaseLock
} from './redis.service.js';
import {
    BadRequestError,
    NotFoundError
} from '../core/error.response.js'; // Custom error handling
import orderModel from '../models/order.model.js';
import mongoose from 'mongoose';
import Stripe from 'stripe';
import {
    CartService
} from './cart.service.js';
import {
    SkuService
} from './sku.service.js';
import PromotionService from './promotion.service.js';
import DiscountService from './discount.service.js';
import {
    resetLoyaltyPoints,
    updateLoyaltyPoints
} from './user.service.js';
import spuModel from '../models/spu.model.js';
import skuModel from '../models/sku.model.js';
import {
    handleDeliverOrder
} from '../models/repositories/order.repo.js';
import {
    SpuService
} from './spu.service.js';
export class OrderService {
    // Place an order by user
    static async orderByUser({
        cartId,
        userId,
        shop_discount,
        products_order,
        user_payment = {},
        user_address = {}
    }) {
        const {
            checkOut_order
        } = await CheckOutService.checkOutRevew({
            cartId,
            userId,
            shop_discount,
            products_order,
        });

        const acquireProduct = [];
        // Verify inventory for each product
        for (let i = 0; i < products_order.length; i++) {
            const {
                productId,
                quantity
            } = products_order[i];
            const keyLock = await acquireLockV2({
                productId,
                quantity,
            });
            acquireProduct.push(keyLock ? true : false);

            if (keyLock) {
                await releaseLock(keyLock);
            }
        }

        // Check if any products are out of stock
        if (acquireProduct.includes(false)) {
            throw new BadRequestError('Một số sản phẩm đã được cập nhật vui lòng quay lại');
        }

        // Create a new order
        const newOrder = await orderModel.create({
            order_userId: userId,
            order_checkout: checkOut_order,
            order_shipping: user_address,
            order_payment: user_payment,
            order_products: products_order,
        });

        // If order creation is successful, remove items from the cart
        if (newOrder) {
            for (let i = 0; i < products_order.length; i++) {
                await CartService.deleteUserCart({
                    userId,
                    productId: products_order[i].productId,
                });
            }
        }

        return newOrder;
    }

    // Get a specific order by user
    static async getOneOrderByUser({
        userId,
        orderId
    }) {
        const order = await orderModel.findOne({
            _id: new mongoose.Types.ObjectId(orderId),
            order_userId: userId
        });

        if (!order) {
            throw new NotFoundError('Đơn hàng không tồn tại');
        }
        return order;
    }

    static async cancelOrderByUser({
        userId,
        orderId
    }) {
        const order = await orderModel.findOne({
            _id: orderId,
            order_userId: userId
        });

        if (!order) {
            throw new NotFoundError('Đơn hàng không tồn tại');
        }

        if (order.order_status !== 'confirmed') {
            throw new BadRequestError('Chỉ đơn hàng đã xác nhận mới có thể huỷ');
        }

        order.order_status = 'cancelled';

        await order.save();

        await Promise.all([
            ...order.order_products.map(({
                skuId,
                spuId,
                quantity,
                promotionId,
            }) => {

                SkuService.updateStockSKU(skuId, -quantity);

                SpuService.updateStockSPU(spuId, -quantity);

                PromotionService.updateAppliedQuantity({
                    promotionId,
                    skuId,
                    spuId,
                    quantity: -quantity
                });


            }),
        ]);

        if (order.order_checkout.usedLoyalPoint > 0) {
            await resetLoyaltyPoints(order.order_userId);
        }

        return order;
    }

    static async updateOrderStatusByAdmin({
        orderId,
        status
    }) {
        const validStatuses = ['confirmed', 'processing', 'shipped', 'cancelled', 'delivered'];
        if (!validStatuses.includes(status)) {
            throw new BadRequestError('Trạng thái đơn hàng không hợp lệ');
        }

        const order = await orderModel.findById(orderId);
        if (!order) {
            throw new NotFoundError('Đơn hàng không tồn tại');
        }

        order.order_status = status;
        await order.save();

        if (status === "delivered") {
            await updateLoyaltyPoints(order.order_userId, order.order_checkout.accLoyalPoint);
            await handleDeliverOrder(order)
        }

        if (status === "cancelled") {
            await Promise.all([
                ...newOrder.order_products.map(({
                    skuId,
                    spuId,
                    quantity,
                    promotionId,

                }) => {
                    SkuService.updateStockSKU(skuId, quantity);
                    SpuService.updateStockSPU(spuId, quantity)
                    PromotionService.updateAppliedQuantity({
                        promotionId,
                        skuId,
                        spuId,
                        quantity
                    })

                })
            ])

        }

        return order;
    }

    static async orderByUserV2({
        cartId,
        userId,
        shop_discount,
        products_order,
        user_payment,
        user_address,
        payment_method = 'COD',
        isUseLoyalPoint,
        orderNote
    }) {
        const session = await mongoose.startSession();
        session.startTransaction();
        let acquireProduct = [];

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        try {
            // Step 1: Checkout review
            const {
                checkOut_order
            } = await CheckOutService.checkOutRevew({
                cartId,
                userId,
                shop_discount,
                products_order,
                isUseLoyalPoint
            });

            // Step 2: Lock inventory
            acquireProduct = await Promise.all(
                products_order.map(async ({
                    skuId,
                    quantity
                }) => {
                    const keyLock = await acquireLockV2({
                        skuId,
                        quantity
                    });
                    if (!keyLock) return {
                        success: false
                    };
                    return {
                        success: true,
                        keyLock,
                        skuId
                    };
                })
            );

            if (acquireProduct.some(result => !result.success)) {
                console.log("🚀 ~ OrderService ~ acquireProduct:", acquireProduct)
                throw new BadRequestError('Một số sản phẩm đã được cập nhật, vui lòng quay lại');
            }

            // Step 3: Handle payment based on payment method
            let checkoutSession;
            if (payment_method === 'STRIPE') {
                // Create Stripe Checkout Session instead of PaymentIntent
                checkoutSession = await stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    mode: 'payment',
                    line_items: products_order.map(product => ({
                        price_data: {
                            currency: 'vnd',
                            product_data: {
                                name: 'Thanh toán đơn hàng',
                            },
                            unit_amount: product.priceAfterDiscount,
                        },
                        quantity: product.quantity,
                    })),
                    metadata: {
                        userId,
                        cartId,
                        order_products: JSON.stringify(products_order.map(p => p.productId))
                    },
                    success_url: `${process.env.FRONTEND_URL}/order/order-success/{CHECKOUT_SESSION_ID}`,
                    cancel_url: `${process.env.FRONTEND_URL}/order/order-failed`,
                });
            }

            // Step 4: Create order
            const [newOrder] = await orderModel.create([{
                order_userId: userId,
                order_checkout: checkOut_order,
                order_shipping: user_address,
                order_discount: shop_discount,
                order_payment: {
                    ...user_payment,
                    status: payment_method === 'STRIPE' ? 'pending' : 'succeeded',
                    payment_method,
                    checkout_session_id: checkoutSession?.id
                },
                order_products: products_order,
                order_note: orderNote,
                order_status: payment_method === 'STRIPE' ? 'pending' : 'confirmed'
            }], {
                session
            });

            // Step 5: Update inventory and delete cart items for non-Stripe payments, update discount use
            if (payment_method !== 'STRIPE') {
                await Promise.all([
                    ...newOrder.order_products.map(({
                        skuId,
                        spuId,
                        quantity,
                        promotionId,

                    }) => {
                        SkuService.updateStockSKU(skuId, quantity);
                        SpuService.updateStockSPU(spuId, quantity)
                        PromotionService.updateAppliedQuantity({
                            promotionId,
                            skuId,
                            spuId,
                            quantity
                        })
                    }),
                    ...newOrder.order_products.map(({
                            skuId
                        }) =>
                        CartService.deleteUserCart({
                            userId: newOrder.order_userId,
                            skuId
                        })
                    ),
                    ...shop_discount.map((discountId) => {
                        DiscountService.addDiscountUserUsage(discountId, userId)
                    })
                ]);
                if (newOrder.order_checkout.usedLoyalPoint > 0) {
                    await resetLoyaltyPoints(newOrder.order_userId);
                }
                // update loyadl point

            }

            // Step 6: Commit transaction
            await session.commitTransaction();

            // Step 7: Release locks
            await Promise.all(
                acquireProduct.map(({
                    keyLock
                }) => releaseLock(keyLock))
            );

            // Return different results based on payment method
            return payment_method === 'STRIPE' ? {
                sessionId: checkoutSession.id,
                order: newOrder
            } : {
                order: newOrder
            };

        } catch (error) {
            // Rollback transaction
            await session.abortTransaction();

            // Release all acquired locks
            if (acquireProduct?.length) {
                await Promise.all(
                    acquireProduct
                    .filter(result => result.keyLock)
                    .map(({
                        keyLock
                    }) => releaseLock(keyLock))
                );
            }
            throw error;
        } finally {
            await session.endSession();
        }
    }

    static async handleStripeWebhook(event) {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;


            const mongoSession = await mongoose.startSession();
            mongoSession.startTransaction();

            try {
                // Find the order using checkout session ID
                const order = await orderModel.findOne({
                    'order_payment.checkout_session_id': session.id
                });

                if (!order) {
                    throw new Error('Order not found');
                }

                // Update order status
                order.order_status = 'confirmed';
                order.order_payment.status = 'succeeded';

                await order.save({
                    session: mongoSession
                });

                // neu su dung thi reset loyalpoint
                if (order.order_checkout.usedLoyalPoint > 0) {
                    await resetLoyaltyPoints(order.order_userId);
                }
                // update loyadl point

                // Update inventory and clear cart, update applied produt in promotion, update discount use
                await Promise.all([
                    ...order.order_products.map(({
                        skuId,
                        spuId,
                        quantity,
                        promotionId,

                    }) => {
                        SkuService.updateStockSKU(skuId, quantity, mongoSession);
                        SpuService.updateStockSPU(spuId, quantity)
                        PromotionService.updateAppliedQuantity({
                            promotionId,
                            skuId,
                            spuId,
                            quantity
                        })
                    }),
                    ...order.order_products.map(({
                            skuId
                        }) =>
                        CartService.deleteUserCart({
                            userId: order.order_userId,
                            skuId
                        }, mongoSession)
                    ),
                    ...order.order_discount.map((discountId) => {
                        DiscountService.addDiscountUserUsage(discountId, userId)
                    })


                ]);


                await mongoSession.commitTransaction();
            } catch (error) {
                await mongoSession.abortTransaction();
                throw error;
            } finally {
                await mongoSession.endSession();
            }
        }
    }

    static async getListOrderByUser({
        userId,
        status = "all"
    }) {
        let orders
        if (status === "all") {
            orders = await orderModel.find({
                order_userId: userId,
            }).sort({
                createdAt: -1
            });
        } else {
            orders = await orderModel.find({
                order_userId: userId,
                order_status: status,
            }).sort({
                createdAt: -1
            });
        }


        if (!orders || orders.length === 0) {
            throw new NotFoundError('Không có đơn hàng nào với trạng thái này');
        }

        return orders;
    }

    static async getListOrderByAdmin({
        limit = 10,
        page = 1,
        order_status = null
    }) {
        const skip = (page - 1) * limit;

        try {
            const query = {};
            if (order_status) {
                query.order_status = order_status;
            }

            const totalResult = await orderModel.countDocuments(query);
            const totalPages = Math.ceil(totalResult / limit);

            const orders = await orderModel.find(query)
                .populate("order_userId")
                .sort({
                    createdAt: -1
                })
                .limit(limit)
                .skip(skip)
                .lean();

            return {
                orders,
                pagination: {
                    totalResult,
                    totalPages,
                    currentPage: page
                }
            };
        } catch (error) {
            throw new Error(`Lỗi khi lấy danh sách đơn hàng: ${error.message}`);
        }
    }


    static async getOneOrderByAdmin({
        orderId
    }) {
        const order = await orderModel.findById(orderId).populate("order_userId");

        if (!order) {
            throw new NotFoundError('Đơn hàng không tồn tại');
        }

        return order;
    }

    static async getOrderCountByStatus() {
        try {
            const orderCountByStatus = await orderModel.aggregate([{
                    $group: {
                        _id: "$order_status",
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        count: -1
                    }
                }
            ]);

            return orderCountByStatus;
        } catch (error) {
            throw new Error(`Lỗi khi đếm số lượng đơn hàng theo trạng thái: ${error.message}`);
        }
    }

    static hasUserPurchasedProduct = async ({
        userId,
        spuId
    }) => {
        try {

            const orders = await orderModel.find({
                order_userId: userId,
                'order_products.spuId': spuId,
                order_status: "delivered"
            });

            return orders.length > 0;
        } catch (error) {
            console.error('Error checking user purchase:', error);
            throw new Error('Failed to check user purchase.');
        }
    };
}