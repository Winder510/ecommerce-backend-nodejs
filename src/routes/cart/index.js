import express from "express";
import cartController from "../../controllers/cart.controller.js";
import {
    asyncErrorHandler
} from "../../helpers/asyncHandler.js";

const router = express.Router()

// get amount a discount
router.post('', asyncErrorHandler(cartController.addToCart))
router.delete('', asyncErrorHandler(cartController.delete))
router.post('/update', asyncErrorHandler(cartController.update))
router.get('', asyncErrorHandler(cartController.listToCart))


export default router