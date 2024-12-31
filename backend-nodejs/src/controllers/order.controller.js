import {
    SuccessResponse
} from '../core/success.response.js';
import {
    OrderService
} from '../services/order.service.js';

class CheckOutController {
    orderByUser = async (req, res, next) => {
        new SuccessResponse({
            message: 'create order success',
            metadata: await OrderService.orderByUser(req.body),
        }).send(res);
    };

    getOneOrderByUser = async (req, res, next) => {
        new SuccessResponse({
            message: 'get one order success',
            metadata: await OrderService.getOneOrderByUser({
                ...req.params,
                userId: req.user.userId
            }),
        }).send(res);
    };

    getOneOrderByAdmin = async (req, res, next) => {
        new SuccessResponse({
            message: 'get one order success',
            metadata: await OrderService.getOneOrderByAdmin({
                ...req.params,
            }),
        }).send(res);
    };

    getOrderCountByStatus = async (req, res, next) => {
        new SuccessResponse({
            message: 'get one order success',
            metadata: await OrderService.getOrderCountByStatus(),
        }).send(res);
    };

    cancelOrderByUser = async (req, res, next) => {
        new SuccessResponse({
            message: 'create order success',
            metadata: await OrderService.cancelOrderByUser({
                ...req.params,
                userId: req.user.userId
            }),
        }).send(res);
    };


    updateOrderStatusByAdmin = async (req, res, next) => {
        new SuccessResponse({
            message: 'create order success',
            metadata: await OrderService.updateOrderStatusByAdmin(req.body),
        }).send(res);
    };

    orderByUserV2 = async (req, res, next) => {
        new SuccessResponse({
            message: 'create order success',
            metadata: await OrderService.orderByUserV2(req.body),
        }).send(res);
    };

    getListOrderByUser = async (req, res, next) => {
        const {
            userId
        } = req.params;
        const {
            status
        } = req.query;
        new SuccessResponse({
            message: 'create order success',
            metadata: await OrderService.getListOrderByUser({
                userId,
                status
            }),
        }).send(res);
    };

    getListOrderForAdmin = async (req, res, next) => {
        new SuccessResponse({
            message: 'get  order ',
            metadata: await OrderService.getListOrderByAdmin({
                ...req.query
            }),
        }).send(res);
    };

    hasUserPurchasedProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Check purchase',
            metadata: await OrderService.hasUserPurchasedProduct({
                ...req.body
            }),
        }).send(res);
    };


}
export default new CheckOutController();