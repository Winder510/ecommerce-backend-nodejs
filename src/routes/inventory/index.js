import express from 'express'
import {
    authenticationV2
} from '../../auth/authUtils.js';
import {
    asyncErrorHandler
} from '../../helpers/asyncHandler.js';
import inventoryController from '../../controllers/inventory.controller.js';

const router = express.Router()




// authentication
router.use(authenticationV2);

router.post('', asyncErrorHandler(inventoryController.addStockToInventory))


export default router