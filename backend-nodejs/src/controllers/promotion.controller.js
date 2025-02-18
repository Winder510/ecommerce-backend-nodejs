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

    updatePromotion = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update promotion successfully',
            metadata: await PromotionService.updatePromotion(req.body),
        }).send(res);
    };

    getListPromotions = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list successfully',
            metadata: await PromotionService.getListPromotions({
                ...req.query
            }),
        }).send(res);
    };

    getOnePromotion = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get one successfully',
            metadata: await PromotionService.getOnePromotion(req.params.id),
        }).send(res);
    };

    toggleUpdateDisable = async (req, res, next) => {
        try {
            const result = await PromotionService.toggleUpdateDisable(req.params.id);
            new SuccessResponse({
                message: result.message,
                metadata: result.updatedPromotion,
            }).send(res);
        } catch (error) {
            next(error);
        }
    };


    getSpuInPromotionIfOverLap = async (req, res, next) => {
        new SuccessResponse({
            message: 'Check overlap',
            metadata: await PromotionService.getSpuInPromotion(req.body),
        }).send(res);
    };

    getActiveFlashSale = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get active promotion',
            metadata: await PromotionService.getActiveFlashSale(),
        }).send(res);
    };

    findOne = async (req, res, next) => {
        new SuccessResponse({
            message: 'Find one promotion',
            metadata: await PromotionService.findOnePromotion(req.params),
        }).send(res);
    };

    getOnePromotionEvent = async (req, res, next) => {
        new SuccessResponse({
            message: 'Find one promotion event',
            metadata: await PromotionService.getOnePromotionEvent(),
        }).send(res);
    };

    getPromotionEventList = async (req, res, next) => {
        new SuccessResponse({
            message: 'Find list promotion event',
            metadata: await PromotionService.getPromotionEventList({}),
        }).send(res);
    };

    getOnePromotionEventById = async (req, res, next) => {
        new SuccessResponse({
            message: 'Find list promotion event',
            metadata: await PromotionService.getOnePromotionEventById({
                ...req.params
            }),
        }).send(res);
    };


    test = async (req, res, next) => {
        new SuccessResponse({
            message: 'Find one promotion',
            metadata: await PromotionService.updateAppliedQuantity({
                ...req.body
            }),
        }).send(res);
    };
    calculateRevenueAndDetails = async (req, res, next) => {
        const {
            promotionId
        } = req.params
        new SuccessResponse({
            message: 'Find one promotion',
            metadata: await PromotionService.calculateRevenueAndDetails(promotionId),
        }).send(res);
    };
}
export default new PromotionController();