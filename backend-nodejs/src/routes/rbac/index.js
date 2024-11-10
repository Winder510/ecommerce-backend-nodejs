import express from 'express';

import { asyncErrorHandler } from '../../helpers/asyncHandler.js';

import { newRole, newResource, listRole, listResource } from '../../controllers/rbac.controller.js';
const router = express.Router();

router.post('/role', asyncErrorHandler(newRole));
router.get('/roles', asyncErrorHandler(listRole));

router.post('/resource', asyncErrorHandler(newResource));
router.get('/resources', asyncErrorHandler(listResource));

export default router;
