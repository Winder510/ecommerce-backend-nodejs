import skuModel from '../sku.model.js';


const findSkuById = async (skuId) => {
    return await skuModel.findById(skuId).lean();
};
const createSkuName = (product_variations, sku) => {
    return sku.sku_index
        .reduce((name, value, index) => {
            return name + ' ' + product_variations[index].options[value];
        }, '')
        .trim();
};

const lowestPriceSKU = (sku_list) => {
    return sku_list.reduce((min, current) => {
        return current.sku_price < min.sku_price ? current : min;
    })
};

const getSpuId = async (skuId) => {
    return await skuModel.findById(skuId).select("product_id -_id").lean()
}

const getQuantityBySpus = async (spuId) => {
    const skus = await skuModel.find({
        product_id: spuId
    })

    const quantity = skus.reduce((acc, sku) => {
        return acc + sku.sku_stock;
    }, 0)

    return quantity;
}
export {
    findSkuById,
    createSkuName,
    lowestPriceSKU,
    getSpuId,
    getQuantityBySpus

};