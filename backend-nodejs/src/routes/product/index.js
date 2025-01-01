import express from 'express';

import {
    asyncErrorHandler
} from '../../helpers/asyncHandler.js';
import productController from '../../controllers/product.controller.js';
import {
    authenticationV2
} from '../../auth/authUtils.js';
import recommendController from '../../controllers/recommend.controller.js';
import {
    grantAccess
} from '../../middleware/rbac.js';


const router = express.Router();

router.get('/search/:keySearch', asyncErrorHandler(productController.getListSearchSpu));


router.get('/spu', asyncErrorHandler(productController.findOneSpu));
router.get('/sku/select', asyncErrorHandler(productController.findOneSku));
router.post('/sku/set-default', asyncErrorHandler(productController.setDefaultSku));
router.get('/sku/select-all', asyncErrorHandler(productController.findOneSku));
router.get('/best-sold', asyncErrorHandler(productController.getBestSoldSpuEachCategory));
router.get('/home-page-product', asyncErrorHandler(productController.getProductForHomePage))
router.get('/recommendations/trending', recommendController.getRecommendTrending)
router.post('/published/all', asyncErrorHandler(productController.getListPublishSpuByCategory));

// routes/recommendation.routes.js
router.get('/recommendations/base/:productId', asyncErrorHandler(recommendController.getRecommendations));
router.get('/recommendationsV2/manyRC/:userId/:productId', asyncErrorHandler(recommendController.getRecommendationsV2));
router.get('/recommendations/profile', asyncErrorHandler(recommendController.getRecommendForProfilePage))
router.get('/spu/filter', asyncErrorHandler(productController.findAllSpuWithCondition));
router.get('/spu/get-published', asyncErrorHandler(productController.getAllPublishedSpu));

router.use(authenticationV2);
router.get('/recommendations/home-page', asyncErrorHandler(recommendController.getRecommendForHomePage))

router.get('/recommendations/cart', asyncErrorHandler(recommendController.getRecommendForCartPage))
router.get('/recommendations/detail-product/:productId', asyncErrorHandler(recommendController.getRecommendForDetailProductPage))

// tam thoi khong check auth
router.post('/spu/new', grantAccess("createAny", "product"), asyncErrorHandler(productController.createSpu));
router.patch('/spu/update/:id', grantAccess("updateAny", "product"), asyncErrorHandler(productController.updateSpu));
router.delete('/spu/delete/:id', grantAccess("deleteAny", "product"), asyncErrorHandler(productController.deleteSpu));

// for admin
router.get('/publish/:id', grantAccess("updateAny", "product"), asyncErrorHandler(productController.publishProduct));
router.get('/unpublish/:id', grantAccess("updateAny", "product"), asyncErrorHandler(productController.unPublishProduct));
router.post('/list-detail-product', grantAccess("readAny", "product"), asyncErrorHandler(productController.getListProdcutDetailsForAdmin));
router.get('/top-products', grantAccess("readAny", "product"), asyncErrorHandler(productController.getBestSoldSpuEachCategory));

router.get('/spu/get-all', grantAccess("readAny", "product"), asyncErrorHandler(productController.getAllSpu));
router.get('/spu/get-draft', grantAccess("readAny", "product"), asyncErrorHandler(productController.getAllDraftSpu));

router.post('/spu/filter-for-promotion', grantAccess("readAny", "product"), asyncErrorHandler(productController.filterSpuForPromotion));
router.post('/spu/filter-for-voucher', grantAccess("readAny", "product"), asyncErrorHandler(productController.filterSpuForVoucher));














export default router