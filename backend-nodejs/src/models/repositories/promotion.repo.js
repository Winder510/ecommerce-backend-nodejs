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


export const getTotalQuantityAppliedAndLimit = async (appliedProducts) => {
    if (!appliedProducts || appliedProducts.length === 0) {
        throw new BadRequestError("No applied products found");
    }

    let totalQuantityLimit = 0;
    let totalAppliedQuantity = 0;

    // Lặp qua từng appliedProduct để tính tổng quantityLimit và appliedQuantity
    appliedProducts.forEach(appliedProduct => {
        appliedProduct.sku_list.forEach(sku => {
            totalQuantityLimit += sku.quantityLimit || 0; // Tính tổng quantityLimit
            totalAppliedQuantity += sku.appliedQuantity || 0; // Tính tổng appliedQuantity
        });
    });

    return {
        totalQuantityLimit,
        totalAppliedQuantity
    };
};