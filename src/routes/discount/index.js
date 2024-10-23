import express from 'express';
import { authenticationV2 } from '../../auth/authUtils.js';
import { asyncErrorHandler } from '../../helpers/asyncHandler.js';
import discountController from '../../controllers/discount.controller.js';

const router = express.Router();

// get amount a discount
router.post('/amount', asyncErrorHandler(discountController.getDiscountAmount));
router.get('/list_product_code', asyncErrorHandler(discountController.getAllProdcutWithDiscountCode));

// authentication
router.use(authenticationV2);

router.post('', asyncErrorHandler(discountController.createDiscount));
router.get('', asyncErrorHandler(discountController.getAllDiscountCode));
router.delete('', asyncErrorHandler(discountController.deleteDiscount));

export default router;
