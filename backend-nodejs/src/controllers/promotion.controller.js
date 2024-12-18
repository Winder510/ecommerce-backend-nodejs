import {
    SuccessResponse
} from "../core/success.response.js";
import PromotionService from "../services/promotion.service.js";

class PromotionController {
    createNew = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update product',
            metadata: await PromotionService.createNewPromotion(req.body),
        }).send(res);
    };

    getSpuInPromotionIfOverLap = async (req, res, next) => {
        new SuccessResponse({
            message: 'Check overlap',
            metadata: await PromotionService.getSpuInPromotion(req.body),
        }).send(res);
    };


}
export default new PromotionController();