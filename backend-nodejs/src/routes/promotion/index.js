import express from 'express';
import {
    asyncErrorHandler
} from '../../helpers/asyncHandler.js';
import promotionController from '../../controllers/promotion.controller.js';
import {
    grantAccess
} from '../../middleware/rbac.js';
import {
    authenticationV2
} from '../../auth/authUtils.js';

const router = express.Router();


router.get('/get-event', asyncErrorHandler(promotionController.getOnePromotionEvent));
router.get('/get-events', asyncErrorHandler(promotionController.getPromotionEventList));
router.get('/get-event/:promotionId', asyncErrorHandler(promotionController.getOnePromotionEventById));

router.get('/check-overlap', asyncErrorHandler(promotionController.getSpuInPromotionIfOverLap));
router.get('/active-flash-sale', asyncErrorHandler(promotionController.getActiveFlashSale));
router.get('/find-one/:promotionId', asyncErrorHandler(promotionController.findOne));

router.post('/test', asyncErrorHandler(promotionController.test));

router.use(authenticationV2);

router.post('', grantAccess("createAny", "promotion"), asyncErrorHandler(promotionController.createNew));
router.patch('', grantAccess("updateAny", "promotion"), asyncErrorHandler(promotionController.updatePromotion));
router.get('/get-one/:id', grantAccess("readAny", "promotion"), asyncErrorHandler(promotionController.getOnePromotion));
router.get('/get-list', grantAccess("readAny", "promotion"), asyncErrorHandler(promotionController.getListPromotions));
router.patch('/toggle-disable/:id', grantAccess("updateAny", "promotion"), asyncErrorHandler(promotionController.toggleUpdateDisable));
router.get('/statictis/:promotionId', grantAccess("readAny", "promotion"), asyncErrorHandler(promotionController.calculateRevenueAndDetails));
export default router;