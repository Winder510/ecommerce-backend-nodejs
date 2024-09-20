import {
    BadRequestError,
    NotFoundError
} from "../core/error.response.js"
import discountModel from "../models/discount.model.js"
import {
    checkDiscountExists,
    findAllDiscountCodeUnSelect
} from "../models/repositories/discount.repo.js"
import {
    findAllProducts
} from "../models/repositories/product.repo.js"


export default class DiscountService {
    static async createDisCountCode(payload) {
        const {
            code,
            start_date,
            end_date,
            is_active,
            min_order_value,
            product_ids,
            applies_to,
            name,
            description,
            type,
            value,
            max_value,
            max_uses,
            uses_count,
            max_uses_per_user
        } = payload

        const foundDiscount = await discountModel.findOne({
            discount_code: code,
        })

        if (foundDiscount && foundDiscount.discount_is_active) {
            throw new BadRequestError("Discount exists")
        }

        const newDiscount = discountModel.create({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_value: value,
            discount_code: code,
            discount_start: new Date(start_date),
            discount_end: new Date(end_date),
            discount_max_uses: max_uses,
            discount_uses_count: uses_count,
            discount_user_used: [],
            discount_max_uses_oper_user: max_uses_per_user,
            discount_min_order_value: min_order_value,
            discount_is_active: is_active,
            discount_max_value: max_value,
            discount_applies_to: applies_to,
            discount_product_ids: applies_to === "all" ? [] : product_ids
        })
        return newDiscount;
    }

    static async updateDiscount() {

    }

    // user
    static async getAllProdcutWithDiscountCode({
        code,
        userId,
        limit,
        page
    }) {
        const foundDiscount = await discountModel.findOne({
            discount_code: code,
        }).lean()

        if (!foundDiscount && !foundDiscount?.discount_is_active) {
            throw new BadRequestError("Discount not exists")
        }

        const {
            discount_applies_to,
            discount_product_ids
        } = foundDiscount

        let products
        if (discount_applies_to === "all") {
            // get all prodcut
            products = await findAllProducts({
                filter: {
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['prodcut_name']
            })
        }
        if (discount_applies_to === "specific") {
            // get some product
            products = await findAllProducts({
                filter: {
                    isPublished: true,
                    _id: {
                        $in: discount_product_ids
                    }
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            })
        }
        return products
    }

    // get all discount of shop
    static async getAllDiscountCodeByShop({
        limit,
        page
    }) {
        const discounts = await findAllDiscountCodeUnSelect({
            limit: +limit,
            page: +page,
            filter: {
                discount_is_active: true
            },
            unSelect: ["__v"],
            model: discountModel
        })
        return discounts
    }

    // apply discount code

    /**
     * 
     *  products:[{
     *      productId, quantity,name,price
     *    }]
     *
     */
    static async getDiscountAmount({
        codeId,
        userId,
        products
    }) {
        const foundDiscount = await checkDiscountExists({
            filter: {
                discount_code: codeId,
            }
        })

        if (!foundDiscount) {
            throw new BadRequestError("Discount not exists")
        }

        const {
            discount_is_active,
            discount_max_uses,
            discount_start,
            discount_end,
            discount_min_order_value,
            discount_max_uses_per_user,
            discount_user_used,
            discount_type,
            discount_value
        } = foundDiscount

        if (!discount_is_active) throw new NotFoundError("discount exprire")
        if (!discount_max_uses) throw new NotFoundError("discount are out")

        if (new Date() < new Date(discount_start) || new Date() > new Date(discount_end)) {
            throw new NotFoundError("discount exprire")
        }


        // check gia tri toi thieu cua don hang
        let totalOrder = 0;
        if (discount_min_order_value > 0) {
            totalOrder = products.reduce((acc, product) => {
                return acc + (product.quantity * product.price)
            }, 0)

            if (totalOrder < discount_min_order_value) {
                throw new NotFoundError(`discount requirea a minium order value of ${discount_min_order_value}`)
            }
        }

        // check so lan su dung doi voi 1 user
        if (discount_max_uses_per_user > 0) {
            let count_uses = discount_user_used.reduce((acc, id) => {
                if (id === userId) {
                    return acc + 1;
                }
            }, 0)
            if (count_uses >= discount_max_uses_per_user) throw new NotFoundError(`you have used it all `)
        }

        // check xem discount nay là fix_amount,..
        const amount = discount_type === "fixed_amount" ? discount_value : totalOrder * (discount_value / 100)

        return {
            totalOrder,
            discount: amount,
            totalPrice: totalOrder - amount
        }
    }

    static async deleteDiscountCode({
        codeId
    }) {
        const deleted = await discountModel.findByIdAndDelete({
            discount_code: codeId
        })

        return deleted
    }

    static async cancelDiscountCode({
        codeId,
        userId
    }) {
        const foundDiscount = await checkDiscountExists({
            filter: {
                discount_code: codeId
            }
        })
        if (!foundDiscount) throw new NotFoundError("Discount not exists")

        const result = await discountModel.findByIdAndUpdate(foundDiscount._id, {
            $pull: {
                discount_user_used: userId
            },
            $inc: {
                discount_max_uses: 1,
                discount_uses_count: -1
            }
        })

        return result
    }
}