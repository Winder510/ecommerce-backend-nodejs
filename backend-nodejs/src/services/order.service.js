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
            _id: orderId,
            order_userId: userId
        });
        if (!order) {
            throw new NotFoundError('Đơn hàng không tồn tại');
        }
        return order;
    }

    // Cancel an order by user
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

        if (order.order_status !== 'pending') {
            throw new BadRequestError('Chỉ đơn hàng chờ xác nhận mới có thể huỷ');
        }

        order.order_status = 'cancelled';
        await order.save();

        return order;
    }

    // Update order status by admin
    static async updateOrderStatusByAdmin({
        orderId,
        status
    }) {
        const validStatuses = ['pending', 'confirmed', 'shipped', 'cancelled', 'delivered'];
        if (!validStatuses.includes(status)) {
            throw new BadRequestError('Trạng thái đơn hàng không hợp lệ');
        }

        const order = await orderModel.findById(orderId);
        if (!order) {
            throw new NotFoundError('Đơn hàng không tồn tại');
        }

        order.order_status = status;
        await order.save();

        return order;
    }


    // static async orderByUserV2({
    //     cartId,
    //     userId,
    //     shop_discount,
    //     products_order,
    //     user_payment,
    //     user_address,
    //     payment_method = 'COD'
    // }) {
    //     const session = await mongoose.startSession();
    //     session.startTransaction();
    //     let acquireProduct = [];

    //     const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    //     try {
    //         // Step 1: Checkout review
    //         const {
    //             checkOut_order
    //         } = await CheckOutService.checkOutRevew({
    //             cartId,
    //             userId,
    //             shop_discount,
    //             products_order,
    //         });

    //         // Step 2: Lock inventory
    //         acquireProduct = await Promise.all(
    //             products_order.map(async ({
    //                 spuId,
    //                 skuId,
    //                 quantity
    //             }) => {
    //                 const keyLock = await acquireLockV2({
    //                     skuId,
    //                     quantity
    //                 });
    //                 if (!keyLock) return {
    //                     success: false
    //                 };
    //                 return {
    //                     success: true,
    //                     keyLock,
    //                     skuId
    //                 };
    //             })
    //         );

    //         if (acquireProduct.some(result => !result.success)) {
    //             throw new BadRequestError('Một số sản phẩm đã được cập nhật, vui lòng quay lại');
    //         }

    //         // Step 3: Handle payment based on payment method
    //         let paymentIntent;
    //         if (payment_method === 'STRIPE') {
    //             paymentIntent = await stripe.paymentIntents.create({
    //                 amount: checkOut_order.totalCheckOut,
    //                 currency: 'vnd',
    //                 payment_method_types: ['card'],
    //                 metadata: {
    //                     userId,
    //                     order_products: JSON.stringify(products_order.map(p => p.productId))
    //                 }
    //             });
    //         }

    //         // Step 4: Create order - Fixed to use array as first argument
    //         const [newOrder] = await orderModel.create([{
    //             order_userId: userId,
    //             order_checkout: checkOut_order,
    //             order_shipping: user_address,
    //             order_payment: {
    //                 ...user_payment,
    //                 status: payment_method === 'STRIPE' ? 'pending' : 'succeeded',
    //                 payment_method,
    //                 payment_intent_id: paymentIntent?.id
    //             },
    //             order_products: products_order,
    //             order_status: payment_method === 'STRIPE' ? 'pending' : 'confirmed'
    //         }], {
    //             session
    //         });

    //         // // Step 5: Update inventory and delete cart items
    //         // await Promise.all([
    //         //     ...products_order.map(({
    //         //             productId,
    //         //             quantity
    //         //         }) =>
    //         //         ProductService.reduceInventory(productId, quantity, session)
    //         //     ),
    //         //     ...products_order.map(({
    //         //             productId
    //         //         }) =>
    //         //         CartService.deleteUserCart({
    //         //             userId,
    //         //             productId
    //         //         }, session)
    //         //     )
    //         // ]);

    //         // Step 6: Commit transaction
    //         await session.commitTransaction();

    //         // Step 7: Release locks
    //         await Promise.all(
    //             acquireProduct.map(({
    //                 keyLock
    //             }) => releaseLock(keyLock))
    //         );

    //         // Return different results based on payment method
    //         return payment_method === 'STRIPE' ? {
    //             clientSecret: paymentIntent.client_secret
    //         } : {
    //             order: newOrder
    //         };

    //     } catch (error) {
    //         // Rollback transaction
    //         await session.abortTransaction();

    //         // Release all acquired locks
    //         if (acquireProduct?.length) {
    //             await Promise.all(
    //                 acquireProduct
    //                 .filter(result => result.keyLock)
    //                 .map(({
    //                     keyLock
    //                 }) => releaseLock(keyLock))
    //             );
    //         }
    //         throw error;
    //     } finally {
    //         await session.endSession();
    //     }
    // }


    static async orderByUserV2({
        cartId,
        userId,
        shop_discount,
        products_order,
        user_payment,
        user_address,
        payment_method = 'COD'
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
            });

            // Step 2: Lock inventory
            acquireProduct = await Promise.all(
                products_order.map(async ({
                    spuId,
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
            console.log("🚀 ~ OrderService ~ acquireProduct:", acquireProduct)

            if (acquireProduct.some(result => !result.success)) {
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
                            unit_amount: product.price,
                        },
                        quantity: product.quantity,
                    })),
                    metadata: {
                        userId,
                        cartId,
                        order_products: JSON.stringify(products_order.map(p => p.productId))
                    },
                    success_url: `${process.env.FRONTEND_URL}/order-success/{CHECKOUT_SESSION_ID}`,
                    cancel_url: `${process.env.FRONTEND_URL}/checkout`,
                });
            }

            // Step 4: Create order
            const [newOrder] = await orderModel.create([{
                order_userId: userId,
                order_checkout: checkOut_order,
                order_shipping: user_address,
                order_payment: {
                    ...user_payment,
                    status: payment_method === 'STRIPE' ? 'pending' : 'succeeded',
                    payment_method,
                    checkout_session_id: checkoutSession?.id
                },
                order_products: products_order,
                order_status: payment_method === 'STRIPE' ? 'pending' : 'confirmed'
            }], {
                session
            });

            // Step 5: Update inventory and delete cart items for non-Stripe payments
            if (payment_method !== 'STRIPE') {
                await Promise.all([
                    ...products_order.map(({
                            productId,
                            quantity
                        }) =>
                        ProductService.reduceInventory(productId, quantity, session)
                    ),
                    ...products_order.map(({
                            productId
                        }) =>
                        CartService.deleteUserCart({
                            userId,
                            productId
                        }, session)
                    )
                ]);
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

            // Start MongoDB session
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

                // Update inventory and clear cart
                await Promise.all([
                    ...order.order_products.map(({
                            productId,
                            quantity
                        }) =>
                        ProductService.reduceInventory(productId, quantity, mongoSession)
                    ),
                    ...order.order_products.map(({
                            productId
                        }) =>
                        CartService.deleteUserCart({
                            userId: order.order_userId,
                            productId
                        }, mongoSession)
                    )
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
}