import express from 'express'

import {
    asyncErrorHandler
} from '../../helpers/asyncHandler.js';
import commentController from '../../controllers/comment.controller.js';

const router = express.Router()

router.get('', asyncErrorHandler(commentController.getListComment))
router.post('', asyncErrorHandler(commentController.createComment))
router.delete('', asyncErrorHandler(commentController.deleteComments))


export default router