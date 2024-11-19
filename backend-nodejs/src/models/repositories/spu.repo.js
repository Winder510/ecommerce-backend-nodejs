import {
    PRODUCT_STATUS
} from '../../constant/index.js';
import {
    getSelectData
} from '../../utils/index.js';
import {
    productModel
} from '../product.model.js';
import spuModel from '../spu.model.js';
import {
    findSkuById
} from './sku.repo.js';

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
    return await spuModel
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-isDraft -isPublished -isDeleted -updatedAt -__v')
        .lean()
        .exec();
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
    updateQuantitySpu
};