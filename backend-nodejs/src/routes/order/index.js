import express from 'express';
import {
    asyncErrorHandler
} from '../../helpers/asyncHandler.js';
import orderController from '../../controllers/order.controller.js';
import {
    authenticationV2
} from '../../auth/authUtils.js';
import {
    grantAccess
} from '../../middleware/rbac.js';

const router = express.Router();

router.use(authenticationV2)
//admin
router.get('/get-all-for-admin', asyncErrorHandler(orderController.getListOrderForAdmin));
router.post('/change-status', asyncErrorHandler(orderController.updateOrderStatusByAdmin));
router.get('/get-one-for-admin/:orderId', asyncErrorHandler(orderController.getOneOrderByAdmin));
router.get('/count-order', asyncErrorHandler(orderController.getOrderCountByStatus));


// user
router.post('/check-purchase', asyncErrorHandler(orderController.hasUserPurchasedProduct));
router.post('', asyncErrorHandler(orderController.orderByUserV2));
router.get('/:orderId', asyncErrorHandler(orderController.getOneOrderByUser));
router.delete('/:orderId', asyncErrorHandler(orderController.cancelOrderByUser));
router.post('/find-all/:userId', asyncErrorHandler(orderController.getListOrderByUser));

export default router;