import express from 'express';
import {
    asyncErrorHandler
} from '../../helpers/asyncHandler.js';
import promotionController from '../../controllers/promotion.controller.js';

const router = express.Router();

router.post('', asyncErrorHandler(promotionController.createNew));
router.get('/check-overlap', asyncErrorHandler(promotionController.getSpuInPromotionIfOverLap));


export default router;