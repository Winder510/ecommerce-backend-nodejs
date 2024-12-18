import promotionModel from "../models/promotion.model.js";
import {
    BadRequestError,
    NotFoundError
} from '../core/error.response.js'

import {
    getListAppliedSpu,
    isTimeSlotAvailable
} from '../models/repositories/promotion.repo.js'
class PromotionService {
    static async createNewPromotion({
        prom_name,
        prom_banner = '',
        appliedProduct,
        startTime,
        endTime,
    }) {
        const newPromotion = new promotionModel({
            prom_name,
            prom_banner,
            appliedProduct,
            startTime,
            endTime,
        });

        const savedPromotion = await newPromotion.save();
        return savedPromotion;
    }

    static async deletePromotion(promotionId) {

        const deletedPromotion = await promotionModel.findByIdAndDelete(promotionId);

        if (!deletedPromotion) {
            throw new NotFoundError('Promotion not found');
        }

        return deletedPromotion;

    }

    static async getSpuInPromotion({
        startTime,
        endTime
    }) {

        const promotionOverLap = await isTimeSlotAvailable(startTime, endTime);

        if (promotionOverLap) {
            return await getListAppliedSpu(promotionOverLap._id)
        }

        return [];
    }

    static async createNewFlashSale({
        prom_name,
        prom_banner = '',
        event_type = 'Flash sale',
        appliedProduct,
        startTime,
        endTime,
    }) {
        const newPromotion = new promotionModel({
            prom_name,
            prom_banner,
            appliedProduct,
            startTime,
            endTime,
            event_type
        });

        const savedPromotion = await newPromotion.save();
        return savedPromotion;
    }

    static async deleteFlashSale(promotionId) {
        const deletedPromotion = await promotionModel.findByIdAndDelete(promotionId);

        if (!deletedPromotion) {
            throw new NotFoundError('Promotion not found');
        }

        return deletedPromotion;

    }

    static async getListFlashSale() {
        return await promotionModel.find({
            event_type: 'Flash sale'
        })
    }
}
export default PromotionService;