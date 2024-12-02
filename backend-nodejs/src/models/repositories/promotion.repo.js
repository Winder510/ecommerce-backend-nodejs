import promotionModel from "../promotion.model.js";
import {
    getSpuIdBySku
} from '../repositories/sku.repo.js'
export const isTimeSlotAvailable = async (startTime, endTime) => {
    const overlappingPromotion = await promotionModel.findOne({
        $or: [{
                startTime: {
                    $lt: endTime
                },
                endTime: {
                    $gt: startTime
                }
            },
            {
                startTime: {
                    $gte: startTime,
                    $lt: endTime
                }
            },
            {
                endTime: {
                    $gt: startTime,
                    $lte: endTime
                }
            }
        ]
    }).lean();
    return overlappingPromotion;
};

export const getListAppliedSpu = async (promotionId) => {
    const spus = await promotionModel.findById(promotionId).select("appliedProduct.productId -_id");
    const spuIds = spus.appliedProduct?.map(product => product.productId);
    return spuIds;
}