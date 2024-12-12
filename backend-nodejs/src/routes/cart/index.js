import express from 'express';
import cartController from '../../controllers/cart.controller.js';
import {
    asyncErrorHandler
} from '../../helpers/asyncHandler.js';

const router = express.Router();


router.post('', asyncErrorHandler(cartController.addToCart));
router.delete('', asyncErrorHandler(cartController.delete));
router.post('/update', asyncErrorHandler(cartController.update));
router.get('', asyncErrorHandler(cartController.showCart));
router.post('/replace-item', asyncErrorHandler(cartController.replaceItem));
router.post('/get-cart', asyncErrorHandler(cartController.getCartBUserId));


export default router;