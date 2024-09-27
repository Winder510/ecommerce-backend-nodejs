import express from 'express'

import {
    asyncErrorHandler
} from '../../helpers/asyncHandler.js'
import uploadController from '../../controllers/upload.controller.js'
import {
    uploadDisk
} from '../../configs/multer.config.js'


const router = express.Router()

router.post('/product', asyncErrorHandler(uploadController.uploadFileImage))
router.post('/product/thumb', uploadDisk.single('file'), asyncErrorHandler(uploadController.uploadFileThumb))
router.post('/product/multiple', uploadDisk.array('files', 3), asyncErrorHandler(uploadController.uploadListImageFiles))

export default router