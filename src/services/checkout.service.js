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
import {
    CartService
} from "./cart.service.js";
import DiscountService from "./discount.service.js";

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

        const {
            codeId
        } = shop_discount[0]
        if (shop_discount.length > 0) {
            // gia su chi co 1 discount
            const {
                discount = 0
            } = await DiscountService.getDiscountAmount({
                codeId,
                userId,
                products: checkProductServer
            })
            checkOut_order.totalDiscount += discount;

            if (discount > 0) {
                checkOut_order.totalCheckOut = checkOut_order.totalPrice - checkOut_order.totalDiscount
            }
        }

        const newData = {
            shop_discount,

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

        // check lai so luong trong kho mot lan nua
        for (let i = 0; i < products_order.length; i++) {
            const {
                productId,
                quantity
            } = products_order[i]

        }
    }
}
export default CheckOutService