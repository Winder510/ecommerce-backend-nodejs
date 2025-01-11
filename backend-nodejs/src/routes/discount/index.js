import express from 'express';
import {
    authenticationV2
} from '../../auth/authUtils.js';
import {
    asyncErrorHandler
} from '../../helpers/asyncHandler.js';
import discountController from '../../controllers/discount.controller.js';
import {
    grantAccess
} from '../../middleware/rbac.js';

const router = express.Router();

router.post('', asyncErrorHandler(discountController.createDiscount));

// get amount a discount
router.post('/amount', asyncErrorHandler(discountController.getDiscountAmount));
router.get('/list_product_code', asyncErrorHandler(discountController.getAllProdcutWithDiscountCode));
router.post('/amountV2', asyncErrorHandler(discountController.getDiscountAmountV2));
// authentication
router.use(authenticationV2);

// router.post('', grantAccess("createAny", "discount"), asyncErrorHandler(discountController.createDiscount));
router.patch('/:id', grantAccess("updateAny", "discount"), asyncErrorHandler(discountController.updateDiscount));
router.delete('', grantAccess("deleteAny", "discount"), asyncErrorHandler(discountController.deleteDiscount));
router.get('', asyncErrorHandler(discountController.getAllDiscountCode));

router.get('/find-all', grantAccess("readAny", "discount"), asyncErrorHandler(discountController.findAll));

router.post('/find-all/available', asyncErrorHandler(discountController.filterAllDiscountForClient));
router.post('/find-all/private', asyncErrorHandler(discountController.findPrivateDiscount));

router.post('/test', asyncErrorHandler(discountController.test));


export default router;