import skuModel from "../sku.model.js"

const findSkuById = async (skuId) => {
    return await skuModel.findOne({
        _id: (skuId)
    }).lean()
}

export {
    findSkuById
}