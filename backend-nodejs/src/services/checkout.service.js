import {
    findCartById
} from '../models/repositories/cart.repo.js';
import {
    BadRequestError
} from '../core/error.response.js';

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



}
export default CheckOutService;