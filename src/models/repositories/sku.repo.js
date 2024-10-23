import skuModel from '../sku.model.js';

const findSkuById = async (skuId) => {
    return await skuModel
        .findOne({
            _id: skuId,
        })
        .lean();
};
const createSkuName = (product_variations, sku) => {
    return sku.sku_index
        .reduce((name, value, index) => {
            return name + ' ' + product_variations[index].options[value];
        }, '')
        .trim();
};

export { findSkuById, createSkuName };
