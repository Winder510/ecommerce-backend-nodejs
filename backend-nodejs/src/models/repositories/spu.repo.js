import {
    PRODUCT_STATUS
} from '../../constant/index.js';
import {
    getSelectData
} from '../../utils/index.js';
import {
    productModel
} from '../product.model.js';
import promotionModel from '../promotion.model.js';
import spuModel from '../spu.model.js';
import {
    findSkuById
} from './sku.repo.js';
import {
    BadRequestError
} from '../../core/error.response.js'
const findSpuById = async (spuId) => {
    return await spuModel.findById(spuId).lean();
};

const findListPublishSpuByCategory = async ({
    query,
    limit = 10,
    skip = 0
}) => {
    return await querySpu({
        query,
        limit,
        skip,
    });
};

const findListDraftSpuByCategory = async ({
    query,
    limit = 10,
    skip = 0
}) => {
    return await querySpu({
        query,
        limit,
        skip,
    });
};

const querySpu = async ({
    query,
    sort = {
        created_At: -1,
    },
    limit,
    skip,
}) => {
    const spus = await spuModel
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate({
            path: 'product_category',
            select: 'category_name',
        })
        .select('-isDraft -isPublished -isDeleted -updatedAt -__v')
        .lean()
        .exec();

    const spuswithPrice = await Promise.all(spus.map(async spu => {
        return {
            ...spu,
            product_price: await getPriceSpu(spu._id)
        }
    }));

    return spuswithPrice;
};


const publishSpu = async ({
    product_id
}) => {
    const foundSpu = await spuModel.findOne({
        _id: product_id,
    });

    if (!foundSpu) {
        throw new Error('Product not found');
    }

    return await spuModel.updateOne({
        _id: product_id,
    }, {
        isDraft: false,
        isPublished: true,
    }, );
};

const unPublishSpu = async ({
    product_id
}) => {
    const foundSpu = await spuModel.findOne({
        _id: product_id,
    });

    if (!foundSpu) {
        throw new Error('Product not found');
    }

    return await spuModel.updateOne({
        _id: product_id,
    }, {
        isDraft: true,
        isPublished: false,
    }, );
};

const searchSpuByUser = async ({
    keySearch
}) => {
    const results = await spuModel
        .find({
            isDraft: true,
            $text: {
                $search: keySearch,
            },
        }, {
            score: {
                $meta: 'textScore',
            },
        }, )
        .sort({
            score: {
                $meta: 'textScore',
            },
        })
        .lean();

    return results;
};

const findAllSpu = async ({
    limit,
    sort,
    skip,
    filter,
    select
}) => {
    const sortBy =
        sort === 'ctime' ? {
            _id: -1,
        } : {
            _id: 1,
        };
    const spus = await spuModel
        .find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(getSelectData(select))
        .lean();

    return spus;
};

const buildQuery = ({
    product_status,
    stock_status,
    categoryId
}) => {
    const query = {};

    // Trạng thái sản phẩm
    if (product_status) {
        switch (product_status) {
            case PRODUCT_STATUS.PUBLISHED:
                query.isPublished = true;
                query.isDeleted = false;
                break;
            case PRODUCT_STATUS.DRAFT:
                query.isDraft = true;
                break;
            case PRODUCT_STATUS.DELETED:
                query.isDeleted = true;
                break;
            case PRODUCT_STATUS.ALL:
                break;
        }
    }

    if (stock_status) {
        if ([STOCK_STATUS.IN_STOCK, STOCK_STATUS.LOW_INVENTORY, STOCK_STATUS.OUT_OF_STOCK].includes(stock_status)) {
            query.product_stockStatus = stock_status;
        } else {
            throw new Error('Invalid stock status');
        }
    }

    if (categoryId) {
        if (Array.isArray(categoryId)) {
            query.product_category = {
                $in: categoryId,
            };
        } else {
            query.product_category = {
                $in: [categoryId],
            };
        }
    }

    return query;
};
const findProduct = async ({
    skuId,
    spuId
}) => {
    let product;
    if (skuId) {
        product = await findSkuById(skuId);
    } else if (spuId) {
        product = await findSpuById(spuId);
    }
    return product;
};

const updateQuantitySpu = async (spuId, quantity) => {
    return await productModel.findOneAndUpdate({
        _id: spuId
    }, {
        product_quantity: quantity
    })
}

const getSpuByIds = async (productIds = [], filter = {}, sort = {}) => {
    try {
        if (!Array.isArray(productIds) || productIds.length === 0) {
            return {
                products: [],
                totalResult: 0,
            };
        }

        const products = await spuModel
            .find({
                _id: {
                    $in: productIds
                },
                ...filter,
            })
            .sort(sort)
            .lean();

        if (!products.length) {
            return {
                products: [],
                totalResult: 0,
            };
        }

        const spusWithPrice = await Promise.all(
            products.map(async (spu) => ({
                ...spu,
                product_price: await getPriceSpu(spu._id),
            }))
        );

        return {
            products: spusWithPrice,
            totalResult: spusWithPrice.length,
        };
    } catch (error) {
        console.error("Error fetching products:", error);
        throw new Error("Failed to fetch products");
    }
};


const getPriceSpu = async (spuId) => {
    const spu = await spuModel.findById(spuId);
    if (!spu) throw new BadRequestError("Not found product")

    const promotionEvent = await promotionModel.findOne({
        status: "active"
    })

    if (!promotionEvent) {
        return {
            orignalPrice: spu.product_price,
            discountValue: 0,
            priceAfterDiscount: spu.product_price
        }
    }

    const productPromotion = promotionEvent.appliedProduct.find(p => {
        return p.productId.toString() === spuId.toString()
    })

    // Nếu sản phẩm không có trong chương trình
    if (!productPromotion) {
        return {
            orignalPrice: spu.product_price,
            discountValue: 0,
            priceAfterDiscount: spu.product_price
        }
    }

    let orignalPrice = spu.product_price;
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
        orignalPrice: spu.product_price,
        discountValue,
        priceAfterDiscount,
    }
}
export {
    findSpuById,
    findListPublishSpuByCategory,
    findListDraftSpuByCategory,
    publishSpu,
    unPublishSpu,
    searchSpuByUser,
    findAllSpu,
    buildQuery,
    findProduct,
    updateQuantitySpu,
    getSpuByIds,
    getPriceSpu
};