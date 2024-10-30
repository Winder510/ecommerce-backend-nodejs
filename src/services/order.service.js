import CheckOutService from './checkout.service.js';
import {
    acquireLock,
    releaseLock
} from './redis.service.js';

export class OrderService {
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
        // check lai so luong trong kho mot lan nua
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