import express from 'express'

import {
    asyncErrorHandler
} from '../../helpers/asyncHandler.js'
import productController from '../../controllers/product.controller.js'

const router = express.Router()

router.post('', asyncErrorHandler(productController.createProduct))


// query

router.get('/draft/all', asyncErrorHandler(productController.getAllDraftProduct))

export default router