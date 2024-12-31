import {
    PRODUCT_STATUS
} from '../../constant/index.js';

import {
    productModel
} from '../product.model.js';
import spuModel from '../spu.model.js';
import {
    findSkuById,
    getLowestPriceSku
} from './sku.repo.js';

import sendSyncMessage from '../../../test/rabbitmq/sync-data.producerDLX.js';
const findSpuById = async (spuId) => {
    return await spuModel.findById(spuId).lean();
};

const querySpu = async ({
    query,
    sort = {
        created_At: -1,
    },
    limit = 10,
    skip = 0,
    page = 0,
}) => {
    // Get total count for pagination info
    const totalResult = await spuModel.countDocuments(query);

    const totalPages = Math.ceil(totalResult / limit);

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

    const spusWithPrice = await Promise.all(spus.map(async spu => {
        return {
            ...spu,
            product_price: await getPriceSpu(spu._id)
        }
    }));

    // Return data with pagination metadata
    return {
        data: spusWithPrice,
        pagination: {
            totalResult,
            totalPages,
            currentPage: page
        }
    };
};
const querySpuV2 = async ({
    query,
    sort = {
        created_At: -1,
    },
    limit = 10,
    offset = 0
}) => {

    const spus = await spuModel
        .find(query)
        .sort(sort)
        .skip(offset)
        .limit(limit)
        .populate({
            path: 'product_category',
            select: 'category_name',
        })
        .select('-isDraft -isPublished -isDeleted -updatedAt -__v')
        .lean()
        .exec();

    const spusWithPrice = await Promise.all(spus.map(async spu => {
        return {
            ...spu,
            product_price: await getPriceSpu(spu._id)
        }
    }));

    return spusWithPrice
};

const publishSpu = async ({
    product_id
}) => {
    const foundSpu = await spuModel.findOne({
        _id: product_id
    }).lean();
    console.log("🚀 ~ foundSpu:", foundSpu)

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
    const foundSpu = await spuModel.findById(product_id).lean();

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
    limit = 10,
    page = 1,
    sortBy
}) => {
    try {
        if (!Array.isArray(productIds) || productIds.length === 0) {
            return {
                products: [],
                pagination: {
                    totalResult: 0,
                    totalPages: 0,
                    currentPage: page
                }
            };
        }

        // Calculate skip based on page number
        const skip = (page - 1) * limit;

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

        // Get total count of matching documents
        const totalResult = await spuModel.countDocuments(query);

        // Calculate total pages
        const totalPages = Math.ceil(totalResult / limit);

        const products = await spuModel
            .find(query)
            .sort(sortOptions)
            .limit(limit)
            .skip(skip)
            .lean();

        if (!products.length) {
            return {
                products: [],
                pagination: {
                    totalResult: 0,
                    totalPages: 0,
                    currentPage: page
                }
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
            pagination: {
                totalResult, // Total number of matching documents
                totalPages, // Total number of pages
                currentPage: page // Current page number
            }

        };
    } catch (error) {
        console.error("Error fetching products:", error);
        throw new Error("Failed to fetch products");
    }
};



const getPriceSpu = async (spuId) => {
    return await getLowestPriceSku(spuId)
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

const updateRatingSpu = async (spuId, newRatingAvg) => {
    return await spuModel.findByIdAndUpdate(spuId, {
        product_ratingAverage: newRatingAvg
    })
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
    buildQueryForClient,
    querySpuV2,
    updateRatingSpu
};