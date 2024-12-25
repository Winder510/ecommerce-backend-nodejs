import express from 'express';

import {
    asyncErrorHandler
} from '../../helpers/asyncHandler.js';

import {
    newRole,
    newResource,
    listRole,
    listResource,
    listRoleForDisplay
} from '../../controllers/rbac.controller.js';
const router = express.Router();

router.post('/role', asyncErrorHandler(newRole));
router.get('/roles', asyncErrorHandler(listRole));

router.post('/resource', asyncErrorHandler(newResource));
router.get('/resources', asyncErrorHandler(listResource));

///
router.get('/list/roles', asyncErrorHandler(listRoleForDisplay));
export default router;