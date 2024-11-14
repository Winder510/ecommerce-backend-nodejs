import express from 'express';
import {
    asyncErrorHandler
} from '../../helpers/asyncHandler.js';
import orderController from '../../controllers/order.controller.js';

const router = express.Router();

router.post('', asyncErrorHandler(orderController.orderByUser));
router.post('/:orderId', asyncErrorHandler(orderController.getOneOrderByUser));
router.post('', asyncErrorHandler(orderController.cancelOrderByUser));
router.post('', asyncErrorHandler(orderController.updateOrderStatusByAdmin));



export default router;