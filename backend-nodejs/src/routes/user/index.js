import express from 'express';

import {
    asyncErrorHandler
} from '../../helpers/asyncHandler.js';
import userController from '../../controllers/user.controller.js';
import {
    authenticationV2
} from '../../auth/authUtils.js';
import {
    grantAccess
} from '../../middleware/rbac.js';

const router = express.Router();


router.get('/statistic', asyncErrorHandler(userController.getUserStats));
router.post('/address', asyncErrorHandler(userController.addNewUserAddress));
router.get('/address/:id', asyncErrorHandler(userController.getUserAddress));
router.get('/default/address/:id', asyncErrorHandler(userController.getUserDefaultAddress));
router.get('/welcome', asyncErrorHandler(userController.checkLoginEmailToken));
router.patch('', asyncErrorHandler(userController.changePassword));
router.use(authenticationV2);
router.put("/profile", asyncErrorHandler(userController.updateUserProfile));

router.post('/new_user', grantAccess("createAny", "user"), asyncErrorHandler(userController.newUser));
router.post('/change-status', grantAccess("updateAny", "user"), asyncErrorHandler(userController.changeUserStatus));
router.post('/change-role', grantAccess("updateAny", "user"), asyncErrorHandler(userController.changeUserRole));
router.get('/find-all', grantAccess("readAny", "user"), asyncErrorHandler(userController.getListUserForAddmin));

router.get('/role', asyncErrorHandler(userController.getUserRole));
export default router;