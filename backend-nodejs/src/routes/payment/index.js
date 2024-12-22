import express from 'express';
import {
    asyncErrorHandler
} from '../../helpers/asyncHandler.js';
import paymentController from '../../controllers/payment.controller.js';
import bodyParser from 'body-parser';

const router = express.Router();

router.get('/create-checkout-section', asyncErrorHandler(paymentController.createCheckoutSession));
router.post('/webhook', express.raw({
    type: 'application/json'
}), asyncErrorHandler(paymentController.handleWebhook));

// stripe listen --forward-to localhost:8000/api/v1/payment/webhook
export default router;