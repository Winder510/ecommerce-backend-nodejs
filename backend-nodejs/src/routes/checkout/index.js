import express from 'express';
import checkoutController from '../../controllers/checkout.controller.js';
import {
    asyncErrorHandler
} from '../../helpers/asyncHandler.js';

const router = express.Router();

router.post('/review', asyncErrorHandler(checkoutController.checkoutPreview));



export default router;