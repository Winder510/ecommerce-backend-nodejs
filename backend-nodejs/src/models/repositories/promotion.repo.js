import promotionModel from "../promotion.model.js";

export const isTimeSlotAvailable = async (
    startTime,
    endTime
) => {
    const overlappingPromotions = await promotionModel.find({
        $or: [{
                startTime: {
                    $lte: endTime
                },
                endTime: {
                    $gt: startTime
                }
            },
            {
                startTime: {
                    $gte: startTime,
                    $lte: endTime
                }
            },
            {
                endTime: {
                    $gte: startTime,
                    $lte: endTime
                }
            }
        ]
    }).lean();
    return overlappingPromotions;
};

export const getListAppliedSpu = async (promotionOverLaps) => {
    // Trích xuất tất cả spuId từ mảng các promotion
    const spuIds = promotionOverLaps
        .flatMap((promotion) =>
            promotion.appliedProduct?.map((product) => product.spuId) || []
        );

    // Loại bỏ các giá trị trùng lặp
    const uniqueSpuIds = [...new Set(spuIds)];
    console.log("🚀 ~ getListAppliedSpu ~ uniqueSpuIds:", uniqueSpuIds)

    return uniqueSpuIds;
};


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