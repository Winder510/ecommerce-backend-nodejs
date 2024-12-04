import express from 'express';
import accessController from '../../controllers/access.controller.js';
import {
    asyncErrorHandler
} from '../../helpers/asyncHandler.js';
import {
    authenticationV2
} from '../../auth/authUtils.js';
const router = express.Router();

//sign up
router.post('/sign-in', asyncErrorHandler(accessController.signin));
router.post('/sign-up', asyncErrorHandler(accessController.signup));
router.get('/google', asyncErrorHandler(accessController.googleLogin));
router.get('/google/callback', asyncErrorHandler(accessController.googleCallback));



// authentication
router.use(authenticationV2);

router.post('/log-out', asyncErrorHandler(accessController.logout));
router.post('/handleRefreshToken', asyncErrorHandler(accessController.handleRefreshToken));

export default router;