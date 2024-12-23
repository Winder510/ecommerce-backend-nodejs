import {
    SuccessResponse
} from "../core/success.response.js";
import {
    PaymentService
} from "../services/payment.service.js";

class PaymentController {
    createCheckoutSession = async (req, res, next) => {
        new SuccessResponse({
            message: 'Payment success',
            metadata: await PaymentService.createCheckoutSession(req.body),
        }).send(res);
    }

    handleWebhook = async (req, res, next) => {
        await PaymentService.handleWebhook(req, res)

    }
}

export default new PaymentController();