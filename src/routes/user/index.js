import express from 'express'

import {
    asyncErrorHandler
} from '../../helpers/asyncHandler.js'
import userController from '../../controllers/user.controller.js'

const router = express.Router()

router.post('/new_user', asyncErrorHandler(userController.newUser))

export default router