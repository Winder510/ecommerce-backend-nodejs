import express from 'express';
import accessController from '../../controllers/access.controller.js';
import { asyncErrorHandler } from '../../helpers/asyncHandler.js';
import { authenticationV2 } from '../../auth/authUtils.js';
const router = express.Router();

//sign up
router.post('/signup', asyncErrorHandler(accessController.signup));
router.post('/login', asyncErrorHandler(accessController.login));

// authentication
router.use(authenticationV2);

router.post('/logout', asyncErrorHandler(accessController.logout));
router.post('/handleRefreshToken', asyncErrorHandler(accessController.handleRefreshToken));

export default router;
