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
router.get('/:product_id', asyncErrorHandler(productController.findProduct))

router.use(authenticationV2);


router.post('', asyncErrorHandler(productController.createProduct))
router.post('/publish/:id', asyncErrorHandler(productController.publishProduct))
router.post('/unpublish/:id', asyncErrorHandler(productController.unPublishProduct))

// query

router.get('/draft/all', asyncErrorHandler(productController.getAllDraftProductForShop))
router.get('/published/all', asyncErrorHandler(productController.getAllPublishedProductForShop))


export default router