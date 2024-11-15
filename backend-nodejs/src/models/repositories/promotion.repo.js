import promotionModel from "../promotion.model.js";
import {
    getSpuId
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
    const skus = await promotionModel.findById(promotionId).select("products.productId -_id");
    const skuIds = skus.products?.map(product => product.productId);
    const data = await Promise.all(skuIds.map(async (skuId) => {
        return await getSpuId(skuId);
    }))
    const spuIds = data.map(spu => spu.product_id);
    const uniqueSpuIds = [...new Set(spuIds.map(id => id.toString().trim()))];
    return uniqueSpuIds

}