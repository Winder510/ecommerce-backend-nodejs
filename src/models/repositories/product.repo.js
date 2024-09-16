import {
    productModel
} from "../product.model.js";

export const findAllDraftProductForShop = async ({
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

export const findAllPublishProductForShop = async ({
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

export const publishProduct = async ({
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

export const unPublishProduct = async ({
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

export const searchProductByUser = async ({
    keySearch
}) => {
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