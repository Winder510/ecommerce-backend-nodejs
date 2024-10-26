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

        const isAvailable = await isTimeSlotAvailable(startTime, endTime);

        if (!isAvailable) {
            throw new BadRequestError('The promotion time slot overlaps with an existing promotion.');
        }

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
        promotionId
    }) {
        return await getListAppliedSpu(promotionId)
    }
}
export default PromotionService;