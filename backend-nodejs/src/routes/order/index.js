import express from 'express';
import {
    asyncErrorHandler
} from '../../helpers/asyncHandler.js';
import orderController from '../../controllers/order.controller.js';

const router = express.Router();

router.post('', asyncErrorHandler(orderController.orderByUser));
router.get('/:orderId', asyncErrorHandler(orderController.getOneOrderByUser));
router.delete('/:orderId', asyncErrorHandler(orderController.cancelOrderByUser));
router.post('/change-status', asyncErrorHandler(orderController.updateOrderStatusByAdmin));
router.post('/test', asyncErrorHandler(orderController.orderByUserV2));


export default router;