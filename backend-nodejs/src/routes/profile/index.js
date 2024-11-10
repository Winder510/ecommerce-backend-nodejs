import express from 'express';

import { asyncErrorHandler } from '../../helpers/asyncHandler.js';

import { grantAccess } from '../../middleware/rbac.js';
import profileControler from '../../controllers/profile.controler.js';
const router = express.Router();

router.get('', asyncErrorHandler(profileControler.testRBCA));

export default router;
