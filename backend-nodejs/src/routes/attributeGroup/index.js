import express from 'express';
import { asyncErrorHandler } from '../../helpers/asyncHandler.js';
import attributeGroupController from '../../controllers/attributeGroup.controller.js';

const router = express.Router();

router.post('', asyncErrorHandler(attributeGroupController.create));
router.put('', asyncErrorHandler(attributeGroupController.update));
//router.post('/handleRefreshToken', asyncErrorHandler(accessController.handleRefreshToken))

export default router;
