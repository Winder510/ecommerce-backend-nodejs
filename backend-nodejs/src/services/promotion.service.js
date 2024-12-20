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

    static getActivePromotion = async () => {
        try {
            const currentTime = new Date();
            const activePromotions = await Promotion.find({
                status: 'active',
                disable: false,
                startTime: {
                    $lte: currentTime
                },
                endTime: {
                    $gte: currentTime
                },
            });

            if (activePromotions.length > 0) {
                return activePromotions; // Trả về các Promotion đang hoạt động
            }

            const closestPromotion = await Promotion.find({
                    disable: false,
                    startTime: {
                        $lte: currentTime
                    },
                    endTime: {
                        $gte: currentTime
                    },
                })
                .sort({
                    startTime: 1
                })
                .limit(1);

            return closestPromotion;
        } catch (error) {
            console.error('Error fetching promotion:', error);
            throw error;
        }
    };

    static updateAppliedQuantity = async (promotionId, skuId, quantityPurchased) => {
        // Tìm chương trình khuyến mãi có promotionId
        const promotion = await promotionModel.findById(promotionId);
        if (!promotion) {
            throw new BadRequestError("Promotion not found");
        }

        // Tìm chương trình khuyến mãi có skuId trong danh sách 'appliedProduct'
        let appliedProduct = null;
        for (const product of promotion.appliedProduct) {
            appliedProduct = product.sku_list.find(sku => sku.skuId.toString() === skuId.toString());
            if (appliedProduct) {
                break;
            }
        }

        if (!appliedProduct) {
            throw new BadRequestError("SKU not found in the promotion");
        }

        // Kiểm tra số lượng đã áp dụng và giới hạn số lượng giảm giá
        const {
            appliedQuantity,
            quantityLimit
        } = appliedProduct;
        if (appliedQuantity + quantityPurchased > quantityLimit) {
            throw new BadRequestError("Exceeded quantity limit for the promotion");
        }

        // Cập nhật số lượng đã áp dụng
        appliedProduct.appliedQuantity += quantityPurchased;

        // Cập nhật lại chương trình khuyến mãi trong cơ sở dữ liệu
        await promotion.save();

        return {
            message: "Applied quantity updated successfully",
            appliedQuantity: appliedProduct.appliedQuantity,
            quantityLimit: appliedProduct.quantityLimit,
        };
    };

}
export default PromotionService;