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
const router = express.Router();

router.patch('/role', asyncErrorHandler(updateRole));
router.post('/role', asyncErrorHandler(newRole));
router.get('/roles', asyncErrorHandler(listRole));

router.post('/resource', asyncErrorHandler(newResource));
router.get('/resources', asyncErrorHandler(listResource));

///
router.get('/list/roles', asyncErrorHandler(listRoleForDisplay));
///
router.get('/list/roles-for-admin', asyncErrorHandler(allRoleWithGrant));
export default router;