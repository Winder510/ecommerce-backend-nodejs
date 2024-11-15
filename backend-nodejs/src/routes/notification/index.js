import express from 'express';
import { authenticationV2 } from '../../auth/authUtils.js';
import { asyncErrorHandler } from '../../helpers/asyncHandler.js';
import notificationController from '../../controllers/notification.controller.js';
const router = express.Router();

// not login

router.use(authenticationV2);
// login
router.get('', asyncErrorHandler(notificationController.getListNoti));

export default router;
