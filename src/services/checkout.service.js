import {
    findCartById
} from "../models/repositories/cart.repo.js"
import {
    NotFoundError,
    BadRequestError
} from "../core/error.response.js";
import {
    checkProductByServer
} from "../models/repositories/product.repo.js";

import DiscountService from "./discount.service.js";
import {
    acquireLock,
    releaseLock
} from "./redis.service.js";
import orderModel from "../models/order.model.js";
import {
    CartService
} from "./cart.service.js";

class CheckOutService {
    /**
     *  shop_discount = [{discountId, codeId}]
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
            cartId
        })
        if (!foundCart) throw new BadRequestError("cart is not exist")

        let checkOut_order = {
            totalPrice: 0, // tong tien hang
            feeShip: 0, // phi van chuyen
            totalDiscount: 0, // tong tien discount giam gia
            totalCheckOut: 0 // tong tien phai thanh toán
        }
        // check product available
        const checkProductServer = await checkProductByServer(products_order);
        // console.log("checkProductServer::", checkProductServer)

        const errors = checkProductServer.filter(product => !product || product.error);
        if (errors.length > 0) {
            throw new BadRequest('One or more products are invalid.');
        }

        // tong tien don hang
        checkOut_order.totalPrice = checkProductServer.reduce((acc, product) => {
            return acc + (product.price * product.quantity)
        }, 0)


        if (shop_discount.length > 0) {
            // gia su chi co 1 discount
            const {
                codeId
            } = shop_discount[0]
            const {
                discount = 0
            } = await DiscountService.getDiscountAmount({
                codeId,
                userId,
                products: checkProductServer
            })
            checkOut_order.totalDiscount += discount;

        }

        if (checkOut_order.totalDiscount > 0) {
            checkOut_order.totalCheckOut = checkOut_order.totalPrice - checkOut_order.totalDiscount
        } else {
            checkOut_order.totalCheckOut = checkOut_order.totalPrice
        }

        return {
            raw: {
                shop_discount,
                products_order
            },
            checkOut_order
        }
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
            raw,
            checkOut_order
        } = await CheckOutService.checkOutRevew({
            cartId,
            userId,
            shop_discount,
            products_order,
        })

        const acquireProduct = []
        // check lai so luong trong kho mot lan nua
        for (let i = 0; i < products_order.length; i++) {
            const {
                productId,
                quantity
            } = products_order[i];
            const keyLock = await acquireLock({
                productId,
                quantity,
                cartId
            })
            acquireProduct.push(keyLock ? true : false)

            if (keyLock) {
                await releaseLock(keyLock)
            }
        }

        //check if co mot sp trong kho het hang
        if (acquireProduct.includes(false)) {
            throw new BadRequestError("Một số sản phẩm đã được cập nhật vui lòng quay lại")
        }

        const newOrder = orderModel.create({
            order_userId: userId,
            order_checkout: checkOut_order,
            order_shipping: user_address,
            order_payment: user_payment,
            order_products: products_order
        })


        // truong hop: neu insert thanh cong thi remove product co trong cart

        if (newOrder) {
            for (let i = 0; i < products_order.length; i++) {
                await CartService.deleteUserCart({
                    userId,
                    productId: products_order[i].productId
                })
            }
        }

        return newOrder
    }

    static async getOneOrderByUser() {}

    static async cancelOrderByUser() {}

    static async updateOrderStatusByAdmin() {}

}
export default CheckOutService