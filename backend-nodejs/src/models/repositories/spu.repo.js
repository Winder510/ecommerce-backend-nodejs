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
import sendSyncMessage from '../../../test/rabbitmq/sync-data.producerDLX.js';
const findSpuById = async (spuId) => {
    return await spuModel.findById(spuId).lean();
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
        _id: product_id
    }).lean();

    if (!foundSpu) {
        throw new Error('Product not found');
    }

    const {
        modifiedCount
    } = await spuModel.updateOne({
        _id: product_id
    }, {
        isDraft: false,
        isPublished: true
    });

    if (modifiedCount === 0) {
        throw new Error("Product not updated");
    }

    sendSyncMessage({
        action: "update",
        data: {
            ...foundSpu,
            isDraft: false,
            isPublished: true
        }
    });

    return {
        message: "Product published successfully"
    };
};

const unPublishSpu = async ({
    product_id
}) => {
    const foundSpu = await spuModel.findOne({
        _id: product_id,
    }).lean();

    if (!foundSpu) {
        throw new Error('Product not found');
    }

    const {
        modifiedCount
    } = await spuModel.updateOne({
        _id: product_id
    }, {
        isDraft: true,
        isPublished: false
    });

    if (modifiedCount === 0) {
        throw new Error("Product not updated");
    }
    const ok = {
        ...foundSpu,
        isDraft: true,
        isPublished: false
    }
    console.log("🚀 ~ ok:", ok)
    sendSyncMessage({
        action: "update",
        data: {
            ...foundSpu,
            isDraft: true,
            isPublished: false
        }
    });

    return {
        message: "Product unpublished successfully"
    };
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

const getSpuByIds = async (productIds = [], {
    minPrice,
    maxPrice,
    limit,
    skip,
    sortBy
}) => {
    try {
        if (!Array.isArray(productIds) || productIds.length === 0) {
            return {
                products: [],
                totalResult: 0,
            };
        }

        // Khai báo query để lọc các sản phẩm
        let query = {
            _id: {
                $in: productIds
            }
        };

        // Lọc theo giá nếu có minPrice và maxPrice
        if (minPrice || maxPrice) {
            query.product_price = {};
            if (minPrice) query.product_price.$gte = parseFloat(minPrice);
            if (maxPrice) query.product_price.$lte = parseFloat(maxPrice);
        }

        // Xác định các tùy chọn sắp xếp
        let sortOptions = {};
        switch (sortBy) {
            case 'price_asc':
                sortOptions.product_price = 1;
                break;
            case 'price_desc':
                sortOptions.product_price = -1;
                break;
            case 'best_selling':
                sortOptions.product_quantitySold = -1;
                break;
            case 'newest':
                sortOptions.createdAt = -1;
                break;
            default:
                sortOptions.createdAt = -1;
        }

        // Truy vấn sản phẩm từ MongoDB với các điều kiện lọc và sắp xếp
        const products = await spuModel
            .find(query) // Lọc theo query đã xác định
            .sort(sortOptions) // Sắp xếp theo sortOptions
            .limit(limit) // Giới hạn số lượng kết quả
            .skip(skip) // Bỏ qua số lượng kết quả trước đó
            .lean(); // Trả về dữ liệu thuần (non-Mongo document)

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

const buildQueryForClient = async ({
    product_status,
    stock_status,
    minPrice,
    maxPrice
}) => {

    const query = {};

    // Lọc theo trạng thái sản phẩm
    if (product_status) {
        query.product_status = product_status;
    }

    // Lọc theo trạng thái tồn kho
    if (stock_status) {
        query.stock_status = stock_status;
    }

    // Lọc theo giá
    if (minPrice || maxPrice) {
        query.product_price = {};
        if (minPrice) query.product_price.$gte = parseFloat(minPrice);
        if (maxPrice) query.product_price.$lte = parseFloat(maxPrice);
    }

    return query;
}

export {
    findSpuById,
    publishSpu,
    unPublishSpu,
    searchSpuByUser,
    buildQuery,
    findProduct,
    updateQuantitySpu,
    getSpuByIds,
    getPriceSpu,
    querySpu,
    buildQueryForClient
};