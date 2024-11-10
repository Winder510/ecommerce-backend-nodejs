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
    static async createNewProduct({
        prom_name,
        products,
        startTime,
        endTime,
    }) {

        const newPromotion = new promotionModel({
            prom_name,
            products,
            startTime,
            endTime,
        });

        const savedPromotion = await newPromotion.save();
        return savedPromotion;
    }

    static async deletePromotion(promotionId) {

        const deletedPromotion = await Promotion.findByIdAndDelete(promotionId);

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
}
export default PromotionService;