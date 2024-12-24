import express from 'express';
import {
    asyncErrorHandler
} from '../../helpers/asyncHandler.js';
import promotionController from '../../controllers/promotion.controller.js';

const router = express.Router();

router.post('', asyncErrorHandler(promotionController.createNew));
router.patch('', asyncErrorHandler(promotionController.updatePromotion));
router.get('/get-one/:id', asyncErrorHandler(promotionController.getOnePromotion));
router.post('/get-list', asyncErrorHandler(promotionController.getListPromotions));
router.patch('/toggle-disable/:id', asyncErrorHandler(promotionController.toggleUpdateDisable));

router.get('/get-event', asyncErrorHandler(promotionController.getOnePromotionEvent));
router.get('/get-events', asyncErrorHandler(promotionController.getPromotionEventList));
router.get('/get-event/:promotionId', asyncErrorHandler(promotionController.getOnePromotionEventById));

router.get('/check-overlap', asyncErrorHandler(promotionController.getSpuInPromotionIfOverLap));
router.get('/active-flash-sale', asyncErrorHandler(promotionController.getActiveFlashSale));
router.get('/find-one/:promotionId', asyncErrorHandler(promotionController.findOne));

router.post('/test', asyncErrorHandler(promotionController.test));

export default router;