import {
    getSelectData
} from "../../utils/index.js"
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
    sort = {
        created_At: -1
    },
    limit,
    skip
}) => {
    return await spuModel.find(query).sort(sort).skip(skip).limit(limit).select("-isDraft -isPublished -isDeleted -updatedAt -__v").lean().exec();
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
    const results = await spuModel.find({
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

const findAllSpu = async ({
    limit,
    sort,
    skip,
    filter,
    select
}) => {
    const sortBy = sort === 'ctime' ? {
        _id: -1
    } : {
        _id: 1
    }
    const spus = await productModel.find(filter).sort(sortBy).skip(skip).limit(limit).select(getSelectData(select)).lean();

    return spus;
}

export {
    findSpuById,
    findListPublishSpuByCategory,
    findListDraftSpuByCategory,
    publishSpu,
    unPublishSpu,
    searchSpuByUser,
    findAllSpu
}