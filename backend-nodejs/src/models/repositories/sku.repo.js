import skuModel from '../sku.model.js';


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
    const spuId = getSpuIdBySku(skuId);
    const sku = skuModel.findById(skuId).lean();
    const spu = await spuModel.findById(spuId).lean();
    if (!spu) throw new BadRequestError("Not found product")

    const promotionEvent = await promotionModel.find({
        status: "active"
    })

    if (!promotionEvent) {
        return {
            orignalPrice: sku.sku_price,
            discountValue: 0,
            priceAfterDiscount: sku.sku_price
        }
    }

    // Tìm chi tiết giảm giá của sản phẩm trong chương trình
    const productPromotion = promotionEvent.appliedProduct.find(p => p.productId.toString() === spuId)

    // Nếu sản phẩm không có trong chương trình
    if (!productPromotion) {
        return {
            orignalPrice: sku.sku_price,
            discountValue: 0,
            priceAfterDiscount: sku.sku_price
        }
    }

    let orignalPrice = sku.sku_price;
    let discountValue = 0;
    let priceAfterDiscount = orignalPrice;

    if (productPromotion.discountType === 'PERCENTAGE') {
        discountValue = orignalPrice * (productPromotion.discountValue / 100);

        // Giới hạn mức giảm nếu có
        if (productPromotion.maxDiscountAmount) {
            discountValue = Math.min(
                discountValue,
                productPromotion.maxDiscountAmount
            );
        }
    } else {
        // Giảm giá cố định
        discountValue = productPromotion.discountValue;
    }
    priceAfterDiscount -= discountValue;

    return {
        orignalPrice: sku.sku_price,
        discountValue,
        priceAfterDiscount,
    }
}
export {
    findSkuById,
    createSkuName,
    lowestPriceSKU,
    getSpuIdBySku,
    getQuantityBySpus,
    updateDefaultSku,
    reservationSku,
    getPriceSku
};