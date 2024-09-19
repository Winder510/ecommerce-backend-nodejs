import {
    SuccessResponse
} from "../core/success.response.js";
import DiscountService from "../services/discount.service.js";

class DiscountController {
    createDiscount = async (req, res, next) => {
        new SuccessResponse({
            message: "Create new discount success",
            metadata: await DiscountService.createDisCountCode({
                ...req.body
            })
        }).send(res)
    }

    getAllDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: "Get all discount code success",
            metadata: await DiscountService.getAllDiscountCodeByShop({
                ...req.query
            })
        }).send(res)
    }

    getDiscountAmount = async (req, res, next) => {
        new SuccessResponse({
            message: "success",
            metadata: await DiscountService.getDiscountAmount({
                ...req.body
            })
        }).send(res)
    }

    getAllProdcutWithDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: "success",
            metadata: await DiscountService.getAllProdcutWithDiscountCode({
                ...req.body,
                ...req.query
            })
        }).send(res)
    }


}
export default new DiscountController();