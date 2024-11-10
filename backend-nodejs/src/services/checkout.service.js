import {
    findCartById
} from '../models/repositories/cart.repo.js';
import {
    BadRequestError
} from '../core/error.response.js';

import DiscountService from './discount.service.js';
import {
    acquireLock,
    releaseLock
} from './redis.service.js';
import orderModel from '../models/order.model.js';
import {
    CartService
} from './cart.service.js';
import {
    checkSkuByServer
} from '../models/repositories/order.repo.js';

class CheckOutService {
    /**
     *  shop_discount = [codeId]
     *  products_order = [{ quanity,productId}]
     */
    static async checkOutRevew({
        cartId,
        userId,
        shop_discount,
        products_order = []
    }) {
        // check cart id
        const foundCart = findCartById({
            cartId,
        });
        if (!foundCart) throw new BadRequestError('cart is not exist');

        let checkOut_order = {
            totalPrice: 0, // tong tien hang
            feeShip: 0, // phi van chuyen
            productDiscount: 0,
            voucherDiscount: 0,
            accLoyalPoint: 0, // diem tich luy duoc
            totalCheckOut: 0, // tong tien phai thanh toán
        };

        // check product available
        const checkProductServer = await checkSkuByServer(products_order);

        const errors = checkProductServer.filter((product) => !product || product.error);
        if (errors.length > 0) {
            throw new BadRequestError('One or more products are invalid.');
        }

        // tong tien don hang
        checkOut_order.totalPrice = checkProductServer.reduce((acc, product) => {
            return acc + product.price * product.quantity;
        }, 0);
        checkOut_order.productDiscount = checkProductServer.reduce((acc, product) => {
            return acc + product.discount * product.quantity;
        }, 0);
        checkOut_order.accLoyalPoint = checkProductServer.reduce((acc, product) => {
            return acc + product.loyalPoint;
        }, 0);

        if (shop_discount.length > 0) {
            let discountAmount = 0;
            await Promise.all(shop_discount.map(async (codeId) => {
                const {
                    discount = 0
                } = await DiscountService.getDiscountAmount({
                    codeId,
                    userId,
                    products: checkProductServer,
                });
                discountAmount += discount
            }));
            checkOut_order.voucherDiscount = discountAmount;

        }

        checkOut_order.totalCheckOut = checkOut_order.totalPrice - checkOut_order.productDiscount - checkOut_order.voucherDiscount;


        return {
            raw: {
                shop_discount,
                products_order,
            },
            checkOut_order,
        };
    }

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
        for (let i = 0; i < products_order.length; i++) {
            const {
                productId,
                quantity
            } = products_order[i];
            const keyLock = await acquireLock({
                productId,
                quantity,
                cartId,
            });
            acquireProduct.push(keyLock ? true : false);

            if (keyLock) {
                await releaseLock(keyLock);
            }
        }

        //check if co mot sp trong kho het hang
        if (acquireProduct.includes(false)) {
            throw new BadRequestError('Một số sản phẩm đã được cập nhật vui lòng quay lại');
        }

        const newOrder = orderModel.create({
            order_userId: userId,
            order_checkout: checkOut_order,
            order_shipping: user_address,
            order_payment: user_payment,
            order_products: products_order,
        });

        // truong hop: neu insert thanh cong thi remove product co trong cart

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

    static async getOneOrderByUser() {}

    static async cancelOrderByUser() {}

    static async updateOrderStatusByAdmin() {}
}
export default CheckOutService;