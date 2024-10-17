import express from 'express'

import {
    asyncErrorHandler
} from '../../helpers/asyncHandler.js'
import productController from '../../controllers/product.controller.js'
import {
    authenticationV2
} from '../../auth/authUtils.js'
import {
    grantAccess
} from '../../middleware/rbac.js'

const router = express.Router()

router.get('/search/:keySearch', asyncErrorHandler(productController.getListSearchProduct))
router.get('', grantAccess('deleteAny', 'product'), asyncErrorHandler(productController.findAllProducts))
//router.get('/:product_id', asyncErrorHandler(productController.findProduct))

// tam thoi khong check auth
router.post('/spu/new', asyncErrorHandler(productController.createSpu))
router.get('/spu', asyncErrorHandler(productController.findOneSpu))
router.get('/sku/select', asyncErrorHandler(productController.findOneSku))
router.post('/sku/set-default', asyncErrorHandler(productController.setDefaultSku))
router.get('/sku/selectAll', asyncErrorHandler(productController.findOneSku))
router.get('/list/categoryId')


//router.use(authenticationV2);


router.post('', asyncErrorHandler(productController.createProduct))
router.post('/publish/:id', asyncErrorHandler(productController.publishProduct))
router.post('/unpublish/:id', asyncErrorHandler(productController.unPublishProduct))

// for admin

//router.get('/draft/all', asyncErrorHandler(productController.))
router.get('/published/all', asyncErrorHandler(productController.getListPublishSpuByCategory))
router.get('/top-products', asyncErrorHandler(productController.getBestSoldSpuEachCategory))


export default router