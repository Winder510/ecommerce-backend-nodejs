import express from 'express';

import { asyncErrorHandler } from '../../helpers/asyncHandler.js';
import templateController from '../../controllers/template.controller.js';

const router = express.Router();

router.post('', asyncErrorHandler(templateController.newTemplate));

export default router;
