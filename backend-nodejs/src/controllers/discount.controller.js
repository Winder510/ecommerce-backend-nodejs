import {
    SuccessResponse
} from '../core/success.response.js';
import DiscountService from '../services/discount.service.js';

class DiscountController {
    createDiscount = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create new discount success',
            metadata: await DiscountService.createDisCountCode({
                ...req.body,
            }),
        }).send(res);
    };

    getAllDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all discount code success',
            metadata: await DiscountService.getAllDiscountCodeByShop({
                ...req.query,
            }),
        }).send(res);
    };

    getDiscountAmount = async (req, res, next) => {
        new SuccessResponse({
            message: 'success',
            metadata: await DiscountService.getDiscountAmount({
                ...req.body,
            }),
        }).send(res);
    };

    getAllProdcutWithDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: 'success',
            metadata: await DiscountService.getAllProdcutWithDiscountCode({
                ...req.body,
                ...req.query,
            }),
        }).send(res);
    };

    deleteDiscount = async (req, res, next) => {
        new SuccessResponse({
            message: 'success',
            metadata: await DiscountService.deleteDiscountCode({
                ...req.query,
            }),
        }).send(res);
    };

    findAll = async (req, res, next) => {
        new SuccessResponse({
            message: 'success',
            metadata: await DiscountService.findAll(),
        }).send(res);
    };

    getDiscountAmountV2 = async (req, res, next) => {
        new SuccessResponse({
            message: 'success',
            metadata: await DiscountService.getDiscountAmountV2({
                ...req.body,
            }),
        }).send(res);
    };

    filterAllDiscountForClient = async (req, res, next) => {
        new SuccessResponse({
            message: 'success available',
            metadata: await DiscountService.filterAllDiscountForClient({
                ...req.body,
            }),
        }).send(res);
    };
}
export default new DiscountController();