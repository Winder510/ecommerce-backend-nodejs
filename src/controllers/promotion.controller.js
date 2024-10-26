import {
    SuccessResponse
} from "../core/success.response.js";
import PromotionService from "../services/promotion.service.js";

class PromotionController {
    createNew = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update product',
            metadata: await PromotionService.createNewProduct(req.body),
        }).send(res);
    };

    getSpuInPromotion = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update product',
            metadata: await PromotionService.getSpuInPromotion(req.query),
        }).send(res);
    };
}
export default new PromotionController();