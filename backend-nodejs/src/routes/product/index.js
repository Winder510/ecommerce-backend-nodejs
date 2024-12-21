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
router.get('/sku/select-all', asyncErrorHandler(productController.findOneSku));
router.get('/best-sold', asyncErrorHandler(productController.getBestSoldSpuEachCategory));

//router.use(authenticationV2);

router.post('', asyncErrorHandler(productController.createProduct));
router.post('/publish/:id', asyncErrorHandler(productController.publishProduct));
router.post('/unpublish/:id', asyncErrorHandler(productController.unPublishProduct));

// for admin
router.post('/list-detail-product', asyncErrorHandler(productController.getListProdcutDetailsForAdmin));

router.post('/published/all', asyncErrorHandler(productController.getListPublishSpuByCategory));
router.get('/top-products', asyncErrorHandler(productController.getBestSoldSpuEachCategory));

router.get('/spu/get-all', asyncErrorHandler(productController.getAllSpu));
router.get('/spu/get-published', asyncErrorHandler(productController.getAllPublishedSpu));
router.get('/spu/get-draft', asyncErrorHandler(productController.getAllDraftSpu));

router.get('/spu/filter', asyncErrorHandler(productController.findAllSpuWithCondition));

router.post('/spu/filter-for-promotion', asyncErrorHandler(productController.filterSpuForPromotion));


export default router