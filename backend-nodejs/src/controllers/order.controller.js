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
            metadata: await OrderService.getOneOrderByUser(req.body),
        }).send(res);
    };


    cancelOrderByUser = async (req, res, next) => {
        new SuccessResponse({
            message: 'create order success',
            metadata: await OrderService.cancelOrderByUser(req.body),
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
}
export default new CheckOutController();