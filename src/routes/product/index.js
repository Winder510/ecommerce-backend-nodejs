import express from 'express'

import {
    asyncErrorHandler
} from '../../helpers/asyncHandler.js'
import productController from '../../controllers/product.controller.js'

const router = express.Router()

router.post('', asyncErrorHandler(productController.createProduct))


export default router