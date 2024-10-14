import spuModel from "../spu.model.js"

const findSpuById = async (spuId) => {
    return await spuModel.findOne({
        _id: (spuId)
    }).lean()
}

export {
    findSpuById
}