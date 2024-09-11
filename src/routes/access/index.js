import express from 'express'
import accessController from '../../controllers/access.controller.js'
import {
    asyncErrorHandler
} from '../../helpers/asyncHandler.js'
import {
    authentication
} from '../../auth/authUtils.js'
const router = express.Router()

//sign up
router.post('/shop/signup', asyncErrorHandler(accessController.signup))
router.post('/shop/login', asyncErrorHandler(accessController.login))

// authentication
router.use(authentication);
router.post('/shop/logout', asyncErrorHandler(accessController.logout))


export default router