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


    orderByUser = async (req, res, next) => {
        new SuccessResponse({
            message: 'create order success',
            metadata: await OrderService.orderByUser(req.body),
        }).send(res);
    };


    orderByUser = async (req, res, next) => {
        new SuccessResponse({
            message: 'create order success',
            metadata: await OrderService.orderByUser(req.body),
        }).send(res);
    };
}
export default new CheckOutController();