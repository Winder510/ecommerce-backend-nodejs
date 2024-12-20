import promotionModel from '../promotion.model.js';
import skuModel from '../sku.model.js';
import spuModel from '../spu.model.js';


const findSkuById = async (skuId) => {
    return await skuModel.findById(skuId).lean();
};
const createSkuName = (product_variations, sku) => {
    return sku.sku_index
        .reduce((name, value, index) => {
            return name + ' ' + product_variations[index].options[value];
        }, '')
        .trim();
};

const lowestPriceSKU = (sku_list) => {
    return sku_list.reduce((min, current) => {
        return current.sku_price < min.sku_price ? current : min;
    })
};

const getSpuIdBySku = async (skuId) => {
    return await skuModel.findById(skuId).select("product_id -_id").lean()
}

const getQuantityBySpus = async (spuId) => {
    const skus = await skuModel.find({
        product_id: spuId
    })

    const quantity = skus.reduce((acc, sku) => {
        return acc + sku.sku_stock;
    }, 0)

    return quantity;
}

const updateDefaultSku = async ({
    skuId = null,
    spuId
}) => {
    try {
        await skuModel.updateMany({
            product_id: spuId
        }, {
            $set: {
                sku_default: false
            }
        });
        if (!skuId) {
            // Tìm sản phẩm có giá thấp nhất
            const skuWithLowestPrice = await skuModel.aggregate([{
                    $match: { // Thêm điều kiện lọc
                        product_id: spuId
                    }
                },
                {
                    $sort: {
                        price: 1 // Sắp xếp theo giá thấp nhất
                    }
                },
                {
                    $limit: 1 // Lấy sản phẩm có giá thấp nhất
                }
            ]);

            if (skuWithLowestPrice.length > 0) {
                const skuId = skuWithLowestPrice[0]._id;

                // Cập nhật sản phẩm có giá thấp nhất, đặt `isDefault` = true
                await skuModel.updateOne({
                    _id: skuId
                }, {
                    $set: {
                        sku_default: true
                    }
                });
            } else {
                console.log('No product found.');
            }
        } else {
            await skuModel.updateOne({
                _id: skuId
            }, {
                sku_default: true
            })
        }
    } catch (error) {
        console.error('Error updating default product:', error);
    }
};

const reservationSku = async ({
    skuId,
    quantity
}) => {
    const foundSku = await skuModel.findById(skuId);

    if (!foundSku || foundSku.sku_stock >= quantity) {
        return await skuModel.updateOne({
            _id: skuId
        }, {
            $inc: {
                sku_stock: -quantity,
            }
        });
    } else {
        return null;
    }

}

const getPriceSku = async (skuId) => {
    const obj = await getSpuIdBySku(skuId);
    const spuId = obj.product_id;
    // Sử dụng Promise.all để tối ưu các truy vấn MongoDB
    const [sku, spu, promotionEvents] = await Promise.all([
        skuModel.findById(skuId).lean(),
        spuModel.findById(spuId).lean(),
        promotionModel.find({
            status: "active",
            disable: false,
        }).lean(),
    ]);

    if (!sku || !spu) {
        throw new BadRequestError("Product or SKU not found");
    }

    // Nếu không có chương trình khuyến mãi nào đang hoạt động
    if (!promotionEvents || promotionEvents.length === 0) {

        return {
            originalPrice: sku.sku_price,
            discountValue: 0,
            priceAfterDiscount: sku.sku_price,
        };
    }

    let skuPromotion = null;

    let promotionId;
    // Tìm kiếm chương trình khuyến mãi áp dụng cho SKU
    for (const event of promotionEvents) {
        const appliedProduct = event.appliedProduct?.find(
            (p) => p.spuId.toString() === spuId.toString()
        );

        if (appliedProduct) {
            const skuData = appliedProduct.sku_list?.find(
                (s) => s.skuId.toString() === skuId.toString()

            );


            if (skuData) {
                skuPromotion = skuData;
                promotionId = event._id
                break; // Dừng lại nếu tìm thấy chương trình phù hợp
            }
        }
    }

    // Nếu SKU không có trong bất kỳ chương trình khuyến mãi nào
    if (!skuPromotion) {
        return {
            originalPrice: sku.sku_price,
            discountValue: 0,
            priceAfterDiscount: sku.sku_price,
        };
    }

    let appliedQuantity = skuPromotion.appliedQuantity || 0;
    let quantityLimit = skuPromotion.quantityLimit || 0;

    if (appliedQuantity >= quantityLimit) {
        // Nếu số lượng giảm giá đã áp dụng bằng hoặc vượt quá giới hạn
        return {
            originalPrice: sku.sku_price,
            discountValue: 0,
            priceAfterDiscount: sku.sku_price,
        };
    }

    // Tính 
    // toán giá sau giảm
    let originalPrice = sku.sku_price;
    let discountValue = 0;

    if (skuPromotion.discountType === "PERCENTAGE") {
        discountValue = originalPrice * (skuPromotion.discountValue / 100);

        // Giới hạn mức giảm nếu có
        if (skuPromotion.maxDiscountValue) {
            discountValue = Math.min(
                discountValue,
                skuPromotion.maxDiscountValue
            );
        }
    } else if (skuPromotion.discountType === "FIXED") {
        // Giảm giá cố định
        discountValue = skuPromotion.discountValue;
    }

    const priceAfterDiscount = Math.max(
        originalPrice - discountValue,
        0 // Đảm bảo giá không âm
    );
    console.log("🚀 ~ getPriceSku ~ promotionId:", promotionId)

    return {
        promotionId,
        originalPrice,
        discountValue,
        priceAfterDiscount,
    };


};

const getThumbFromSpu = async (skuId) => {
    // Lấy SPU ID từ SKU ID
    const obj = await getSpuIdBySku(skuId);
    const spuId = obj.product_id;

    // Đồng thời lấy dữ liệu SKU và SPU
    const [sku, spu] = await Promise.all([
        skuModel.findById(skuId).lean(),
        spuModel.findById(spuId).lean(),
    ]);

    const {
        product_variations
    } = spu;
    const {
        sku_index
    } = sku;

    // Kiểm tra tính hợp lệ
    if (!product_variations || !sku_index || sku_index.length !== product_variations.length) {
        throw new Error("Dữ liệu không hợp lệ!");
    }

    // Duyệt qua các variation để tìm ảnh thumbnail
    for (let i = 0; i < sku_index.length; i++) {
        const variation = product_variations[i];
        const index = sku_index[i];

        // Kiểm tra nếu variation có hình ảnh
        if (variation.images && variation.images.length > 0) {
            return variation.images[index] || null; // Lấy ảnh tại chỉ số index
        }
    }

    // Nếu không tìm thấy ảnh, trả về null
    return null;
};
const getLowestPriceSku = async (spuId) => {
    // Lấy thông tin SPU
    const spu = await spuModel.findById(spuId).lean();
    if (!spu) throw new BadRequestError("Product not found");

    // Lấy danh sách các SKU của SPU
    const skus = await skuModel.find({
        product_id: spuId
    }).lean();
    if (!skus || skus.length === 0) {
        throw new BadRequestError("No SKUs found for this product");
    }

    // Lấy các chương trình khuyến mãi đang hoạt động
    const promotionEvents = await promotionModel.find({
        status: "active",
        disable: false,

    }).lean();

    // Nếu không có chương trình khuyến mãi nào, trả về giá thấp nhất của SKU
    if (!promotionEvents || promotionEvents.length === 0) {
        const lowestPriceSku = skus.reduce((minSku, currentSku) => {
            return currentSku.sku_price < minSku.sku_price ? currentSku : minSku;
        });
        return {
            skuId: lowestPriceSku._id,
            originalPrice: lowestPriceSku.sku_price,
            discountValue: 0,
            priceAfterDiscount: lowestPriceSku.sku_price
        };
    }

    // Tìm SKU có giá thấp nhất sau khi áp dụng khuyến mãi
    let lowestPrice = Infinity;
    let bestSku = null;

    for (const sku of skus) {
        let discountValue = 0;

        // Tìm chương trình khuyến mãi áp dụng cho SKU
        for (const event of promotionEvents) {
            const appliedProduct = event.appliedProduct.find(
                (p) => p.spuId.toString() === spuId.toString()
            );

            if (appliedProduct) {
                const skuPromotion = appliedProduct.sku_list?.find(
                    (s) => s.skuId.toString() === sku._id.toString()
                );

                if (skuPromotion) {
                    let appliedQuantity = skuPromotion.appliedQuantity || 0;
                    let quantityLimit = skuPromotion.quantityLimit || 0;
                    if (appliedQuantity >= quantityLimit) {
                        continue;
                    }
                    if (skuPromotion.discountType === "PERCENTAGE") {
                        discountValue = sku.sku_price * (skuPromotion.discountValue / 100);

                        // Giới hạn mức giảm giá nếu có
                        if (skuPromotion.maxDiscountValue) {
                            discountValue = Math.min(
                                discountValue,
                                skuPromotion.maxDiscountValue
                            );
                        }
                    } else if (skuPromotion.discountType === "FIXED") {
                        discountValue = skuPromotion.discountValue;
                    }
                }
            }
        }

        const priceAfterDiscount = Math.max(sku.sku_price - discountValue, 0);

        // Cập nhật SKU có giá thấp nhất
        if (priceAfterDiscount < lowestPrice) {
            lowestPrice = priceAfterDiscount;
            bestSku = {
                skuId: sku._id,
                originalPrice: sku.sku_price,
                discountValue,
                priceAfterDiscount
            };
        }
    }

    return bestSku;
};



export {
    findSkuById,
    createSkuName,
    lowestPriceSKU,
    getSpuIdBySku,
    getQuantityBySpus,
    updateDefaultSku,
    reservationSku,
    getPriceSku,
    getThumbFromSpu,
    getLowestPriceSku,
};