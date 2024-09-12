import express from 'express'
import accessController from '../../controllers/access.controller.js'
import {
    asyncErrorHandler
} from '../../helpers/asyncHandler.js'
import {
    authentication,
    authenticationV2
} from '../../auth/authUtils.js'
const router = express.Router()

//sign up
router.post('/shop/signup', asyncErrorHandler(accessController.signup))
router.post('/shop/login', asyncErrorHandler(accessController.login))

// authentication
router.use(authenticationV2);
router.post('/shop/logout', asyncErrorHandler(accessController.logout))
router.post('/shop/handleRefreshToken', asyncErrorHandler(accessController.handleRefreshToken))


export default router