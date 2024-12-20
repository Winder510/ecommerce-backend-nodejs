import {
    SuccessResponse
} from "../core/success.response.js";
import PromotionService from "../services/promotion.service.js";

class PromotionController {
    createNew = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create promotion successfully',
            metadata: await PromotionService.createNewPromotion(req.body),
        }).send(res);
    };

    getSpuInPromotionIfOverLap = async (req, res, next) => {
        new SuccessResponse({
            message: 'Check overlap',
            metadata: await PromotionService.getSpuInPromotion(req.body),
        }).send(res);
    };

    getActivePromotion = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get active promotion',
            metadata: await PromotionService.getActivePromotion(),
        }).send(res);
    };

    findOne = async (req, res, next) => {
        new SuccessResponse({
            message: 'Find one promotion',
            metadata: await PromotionService.findOnePromotion(req.params),
        }).send(res);
    };
}
export default new PromotionController();