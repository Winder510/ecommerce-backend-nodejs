import express from 'express';

import {
    asyncErrorHandler
} from '../../helpers/asyncHandler.js';
import CategoryController from '../../controllers/category.controller.js';
import {
    grantAccess
} from '../../middleware/rbac.js';
import {
    authenticationV2
} from '../../auth/authUtils.js';

const router = express.Router();
router.get('/all', asyncErrorHandler(CategoryController.getAllCategory));
router.get('/find-one/:id', asyncErrorHandler(CategoryController.findOne));

router.use(authenticationV2);

router.post('', grantAccess("createAny", "category"), asyncErrorHandler(CategoryController.createCategory));
router.patch('/:id', grantAccess("updateAny", "category"), asyncErrorHandler(CategoryController.updateCategory));
router.delete('/:id', grantAccess("deleteAny", "category"), asyncErrorHandler(CategoryController.deleteCategory));

export default router;