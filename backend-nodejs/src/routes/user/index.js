import express from 'express';

import {
    asyncErrorHandler
} from '../../helpers/asyncHandler.js';
import userController from '../../controllers/user.controller.js';
import {
    authenticationV2
} from '../../auth/authUtils.js';

const router = express.Router();

router.post('/new_user', asyncErrorHandler(userController.newUser));
router.post('/address', asyncErrorHandler(userController.addNewUserAddress));
router.get('/address/:id', asyncErrorHandler(userController.getUserAddress));
router.get('/default/address/:id', asyncErrorHandler(userController.getUserDefaultAddress));
router.get('/find-all', asyncErrorHandler(userController.getListUserForAddmin));
router.post('/change-status', asyncErrorHandler(userController.changeUserStatus));
router.get('/welcome', asyncErrorHandler(userController.checkLoginEmailToken));
router.use(authenticationV2);
router.patch('', asyncErrorHandler(userController.changePassword));
router.put("/profile", asyncErrorHandler(userController.updateUserProfile));
router.post('/change-role', asyncErrorHandler(userController.changeUserRole));


export default router;