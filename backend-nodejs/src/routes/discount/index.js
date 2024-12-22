import express from 'express';
import {
    authenticationV2
} from '../../auth/authUtils.js';
import {
    asyncErrorHandler
} from '../../helpers/asyncHandler.js';
import discountController from '../../controllers/discount.controller.js';

const router = express.Router();

// get amount a discount
router.post('/amount', asyncErrorHandler(discountController.getDiscountAmount));
router.get('/list_product_code', asyncErrorHandler(discountController.getAllProdcutWithDiscountCode));
router.post('/amountV2', asyncErrorHandler(discountController.getDiscountAmountV2));
// authentication
//router.use(authenticationV2);

router.post('', asyncErrorHandler(discountController.createDiscount));
router.patch('/:id', asyncErrorHandler(discountController.updateDiscount));
router.get('', asyncErrorHandler(discountController.getAllDiscountCode));
router.delete('', asyncErrorHandler(discountController.deleteDiscount));
router.get('/find-all', asyncErrorHandler(discountController.findAll));
router.post('/find-all/available', asyncErrorHandler(discountController.filterAllDiscountForClient));
router.post('/find-all/private', asyncErrorHandler(discountController.findPrivateDiscount));

export default router;