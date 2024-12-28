import promotionModel from "../promotion.model.js";

export const isTimeSlotAvailable = async (startTime, endTime) => {
    if (!startTime || !endTime || new Date(startTime) >= new Date(endTime)) {
        throw new Error("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc.");
    }

    const overlappingPromotions = await promotionModel.find({
        $or: [
            // 1. Promotion bắt đầu trước khi endTime và kết thúc sau startTime (giao nhau bất kỳ)
            {
                startTime: {
                    $lt: endTime
                },
                endTime: {
                    $gt: startTime
                },
            },
            // 2. Promotion nằm hoàn toàn bên trong khoảng (startTime - endTime)
            {
                startTime: {
                    $gte: startTime,
                    $lte: endTime
                },
            },
            // 3. Promotion bao phủ khoảng (startTime - endTime)
            {
                startTime: {
                    $lte: startTime
                },
                endTime: {
                    $gte: endTime
                },
            },
        ],
    }).lean();

    return overlappingPromotions; // true nếu không có sự kiện nào trùng
};

export const getListAppliedSpu = async (promotionOverLaps) => {
    // Trích xuất tất cả spuId từ mảng các promotion
    const spuIds = promotionOverLaps
        .flatMap((promotion) =>
            promotion.appliedProduct?.map((product) => product.spuId) || []
        );

    // Loại bỏ các giá trị trùng lặp
    const uniqueSpuIds = [...new Set(spuIds)];

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