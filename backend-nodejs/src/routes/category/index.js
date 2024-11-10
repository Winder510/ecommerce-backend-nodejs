import express from 'express';

import { asyncErrorHandler } from '../../helpers/asyncHandler.js';
import CategoryController from '../../controllers/category.controller.js';

const router = express.Router();

router.post('', asyncErrorHandler(CategoryController.createCategory));
router.patch('/:id', asyncErrorHandler(CategoryController.updateCategory));
router.delete('/:id', asyncErrorHandler(CategoryController.deleteCategory));
router.get('/all', asyncErrorHandler(CategoryController.getAllCategory));

export default router;
