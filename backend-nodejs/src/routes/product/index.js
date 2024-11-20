import express from 'express';

import {
    asyncErrorHandler
} from '../../helpers/asyncHandler.js';
import productController from '../../controllers/product.controller.js';
import {
    authenticationV2
} from '../../auth/authUtils.js';


const router = express.Router();

router.get('/search/:keySearch', asyncErrorHandler(productController.getListSearchSpu));

// tam thoi khong check auth
router.post('/spu/new', asyncErrorHandler(productController.createSpu));
router.patch('/spu/update/:id', asyncErrorHandler(productController.updateSpu));
router.delete('/spu/delete/:id', asyncErrorHandler(productController.deleteSpu));
router.get('/spu', asyncErrorHandler(productController.findOneSpu));
router.get('/sku/select', asyncErrorHandler(productController.findOneSku));
router.post('/sku/set-default', asyncErrorHandler(productController.setDefaultSku));
router.get('/sku/selectAll', asyncErrorHandler(productController.findOneSku));
router.get('/best-sold', asyncErrorHandler(productController.getBestSoldSpuEachCategory));

//router.use(authenticationV2);

router.post('', asyncErrorHandler(productController.createProduct));
router.post('/publish/:id', asyncErrorHandler(productController.publishProduct));
router.post('/unpublish/:id', asyncErrorHandler(productController.unPublishProduct));

// for admin
router.get('/draft/all', asyncErrorHandler(productController.getAllDraftSpu))
router.get('/published/all', asyncErrorHandler(productController.getListPublishSpuByCategory));
router.get('/top-products', asyncErrorHandler(productController.getBestSoldSpuEachCategory));
router.get('/management/spu', asyncErrorHandler(productController.findAllSpuWithCondition));

export default router;