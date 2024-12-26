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
router.get('/get-all-for-admin', grantAccess("readAny", 'order'), asyncErrorHandler(orderController.getListOrderForAdmin));
router.post('/change-status', grantAccess("updateAny", 'order'), asyncErrorHandler(orderController.updateOrderStatusByAdmin));
router.get('/get-one-for-admin/:orderId', grantAccess("readAny", 'order'), asyncErrorHandler(orderController.getOneOrderByAdmin));
router.get('/count-order', grantAccess("readAny", 'order'), asyncErrorHandler(orderController.getOrderCountByStatus));


// user
router.post('/check-purchase', grantAccess("readOwn", 'order'), asyncErrorHandler(orderController.hasUserPurchasedProduct));
router.post('', grantAccess("createOwn", 'order'), asyncErrorHandler(orderController.orderByUserV2));
router.get('/:orderId', grantAccess("readOwn", 'order'), asyncErrorHandler(orderController.getOneOrderByUser));
router.delete('/:orderId', grantAccess("updateOwn", 'order'), asyncErrorHandler(orderController.cancelOrderByUser));
router.post('/find-all/:userId', grantAccess("readOwn", 'order'), asyncErrorHandler(orderController.getListOrderByUser));

export default router;