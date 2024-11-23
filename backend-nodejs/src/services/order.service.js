import CheckOutService from './checkout.service.js';
import {
    acquireLock,
    releaseLock
} from './redis.service.js';
import {
    BadRequestError,
    NotFoundError
} from '../core/error.response.js'; // Custom error handling
import orderModel from '../models/order.model.js';

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
}