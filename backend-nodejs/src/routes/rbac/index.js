import express from 'express';

import {
    asyncErrorHandler
} from '../../helpers/asyncHandler.js';

import {
    newRole,
    newResource,
    listRole,
    listResource,
    listRoleForDisplay,
    allRoleWithGrant,
    updateRole
} from '../../controllers/rbac.controller.js';
import {
    grantAccess
} from '../../middleware/rbac.js';
import {
    authenticationV2
} from '../../auth/authUtils.js';
const router = express.Router();

router.post('/resource', asyncErrorHandler(newResource));
router.get('/resources', asyncErrorHandler(listResource));
///
router.get('/list/roles', asyncErrorHandler(listRoleForDisplay));
router.use(authenticationV2);

router.patch('/role', grantAccess("updateAny", "rbac"), asyncErrorHandler(updateRole));
router.post('/role', grantAccess("createAny", "rbac"), asyncErrorHandler(newRole));
router.get('/roles', asyncErrorHandler(listRole));
///
router.get('/list/roles-for-admin', grantAccess("readAny", "rbac"), asyncErrorHandler(allRoleWithGrant));
export default router;