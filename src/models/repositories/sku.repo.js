import skuModel from '../sku.model.js';

const findSkuById = async (skuId) => {
    console.log(skuId)
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
export {
    findSkuById,
    createSkuName,
    lowestPriceSKU
};