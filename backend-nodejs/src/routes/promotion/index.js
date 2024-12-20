import express from 'express';
import {
    asyncErrorHandler
} from '../../helpers/asyncHandler.js';
import promotionController from '../../controllers/promotion.controller.js';

const router = express.Router();

router.post('', asyncErrorHandler(promotionController.createNew));
router.patch('', asyncErrorHandler(promotionController.updatePromotion));
router.get('/get-one/:id', asyncErrorHandler(promotionController.getOnePromotion));
router.get('/get-list', asyncErrorHandler(promotionController.getListPromotions));
router.patch('/toggle-disable/:id', asyncErrorHandler(promotionController.toggleUpdateDisable));


router.get('/check-overlap', asyncErrorHandler(promotionController.getSpuInPromotionIfOverLap));
router.get('/active-flash-sale', asyncErrorHandler(promotionController.getActivePromotion));
router.get('/find-one/:promotionId', asyncErrorHandler(promotionController.findOne));



export default router;