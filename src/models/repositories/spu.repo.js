import spuModel from "../spu.model.js"

const findSpuById = async (spuId) => {
    return await spuModel.findOne({
        _id: (spuId)
    }).lean()
}

const findListPublishSpuByCategory = async ({
    query,
    limit = 10,
    skip = 0
}) => {
    return await querySpu({
        query,
        limit,
        skip
    })
}

const findListDraftSpuByCategory = async ({
    query,
    limit = 10,
    skip = 0
}) => {
    return await querySpu({
        query,
        limit,
        skip
    })
}

const querySpu = async ({
    query,
    limit,
    skip
}) => {
    return await spuModel.find(query).sort({
        updateAt: -1
    }).skip(skip).limit(limit).lean().exec();
}

const publishSpu = async ({
    product_id
}) => {
    const foundSpu = await spuModel.findOne({
        _id: product_id
    });

    if (!foundSpu) {
        throw new Error('Product not found');
    }

    return await spuModel.updateOne({
        _id: product_id
    }, {
        isDraft: false,
        isPublished: true
    });
};

const unPublishSpu = async ({
    product_id
}) => {
    const foundSpu = await spuModel.findOne({
        _id: product_id
    });

    if (!foundSpu) {
        throw new Error('Product not found');
    }

    return await spuModel.updateOne({
        _id: product_id
    }, {
        isDraft: true,
        isPublished: false
    });
};

const searchSpuByUser = async ({
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
export {
    findSpuById,
    findListPublishSpuByCategory,
    findListDraftSpuByCategory,
    publishSpu,
    unPublishSpu,
    searchSpuByUser
}