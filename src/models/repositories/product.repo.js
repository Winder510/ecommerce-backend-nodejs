import {
    convertToObjectIdMongodb,
    getSelectData,
    unGetSelectData
} from "../../utils/index.js";
import {
    productModel
} from "../product.model.js";

const findAllDraftProductForShop = async ({
    query,
    limit,
    skip
}) => {
    return queryProduct({
        query,
        limit,
        skip
    })
}

const findAllPublishProductForShop = async ({
    query,
    limit,
    skip
}) => {
    return queryProduct({
        query,
        limit,
        skip
    })
}

const queryProduct = async ({
    query,
    limit,
    skip
}) => {
    return await productModel.find(query).sort({
        updateAt: -1
    }).skip(skip).limit(limit).lean().exec();
}

const publishProduct = async ({
    product_id
}) => {
    const foundProduct = await productModel.findOne({
        _id: product_id
    });

    if (!foundProduct) {
        throw new Error('Product not found');
    }

    return await productModel.updateOne({
        _id: product_id
    }, {
        isDraft: false,
        isPublished: true
    });
};

const unPublishProduct = async ({
    product_id
}) => {
    const foundProduct = await productModel.findOne({
        _id: product_id
    });

    if (!foundProduct) {
        throw new Error('Product not found');
    }

    return await productModel.updateOne({
        _id: product_id
    }, {
        isDraft: true,
        isPublished: false
    });
};

const searchProductByUser = async ({
    keySearch
}) => {
    const regexSearch = new RegExp(
        keySearch
    )
    console.log(regexSearch)
    const results = await productModel.find({
        isDraft: false,
        $text: {
            $search: keySearch
        }
    }, {
        score: {
            $meta: 'textScore'
        }
    }).sort({
        score: {
            $meta: 'textScore'
        }
    }).lean();

    return results;
}
const findAllProducts = async ({
    limit,
    sort,
    page,
    filter,
    select
}) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? {
        _id: -1
    } : {
        _id: 1
    }
    const products = await productModel.find(filter).sort(sortBy).skip(skip).limit(limit).select(getSelectData(select)).lean();

    return products;
}

const findProduct = async ({
    product_id,
    unSelect
}) => {
    return await productModel.findById(product_id).select(unGetSelectData(unSelect)).lean()
}

const updateProductById = async ({
    product_id,
    payload,
    model,
    isNew = true
}) => {
    return await model.findByIdAndUpdate(product_id, payload, {
        new: isNew
    })
}

const getProductById = async (productId) => {
    return await productModel.findOne({
        _id: (productId)
    }).lean()
}

const checkProductByServer = async (products) => {
    return await Promise.all(products.map(async product => {
        try {
            const foundProduct = await getProductById(product.productId);

            if (foundProduct) {
                return {
                    price: foundProduct.product_price,
                    quantity: product.quantity,
                    productId: product.productId
                };
            } else {
                throw new Error(`Product not found: ${product.productId}`);
            }
        } catch (error) {
            return {
                error: error.message,
                productId: product.productId
            };
        }
    }));
}
export {
    searchProductByUser,
    findAllDraftProductForShop,
    unPublishProduct,
    publishProduct,
    findAllPublishProductForShop,
    findAllProducts,
    findProduct,
    updateProductById,
    getProductById,
    checkProductByServer

}