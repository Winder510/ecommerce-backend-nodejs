import {
    productModel
} from "../product.model.js";

export const findAllDraftProduct = async ({
    query,
    limit,
    skip
}) => {
    return await productModel.find(query).sort({
        updateAt: -1
    }).skip(skip).limit(limit).lean().exec();
}