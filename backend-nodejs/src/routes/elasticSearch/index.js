import express from 'express';

import {
    asyncErrorHandler
} from '../../helpers/asyncHandler.js';
import elasticSearchController from '../../controllers/elasticSearch.controller.js';

const router = express.Router();

router.get('', asyncErrorHandler(elasticSearchController.searchProduct));
router.get('/autocomplete', asyncErrorHandler(elasticSearchController.suggestSearch));

export default router;