import skuModel from '../models/sku.model.js';

import spuModel from '../models/spu.model.js';
import {
    BadRequestError
} from '../core/error.response.js';

import {
    findSpuById
} from '../models/repositories/spu.repo.js';
import {
    createSkuName,
    findSkuById
} from '../models/repositories/sku.repo.js';
import slugify from 'slugify';

export class SkuService {
    static async newSku({
        spu_id,
        product_variations,
        product_name,
        sku_list
    }) {
        const convert_sku_list = sku_list.map((sku) => {
            return {
                ...sku,
                sku_name: product_name + createSkuName(product_variations, sku),
                sku_slug: slugify(product_name + createSkuName(product_variations, sku)),
                product_id: spu_id,
            };
        });
        const newSkus = skuModel.create(convert_sku_list);

        return newSkus;
    }
    static async updateSku({
        spu_id,
        product_variations,
        product_name,
        sku_list
    }) {
        const convert_sku_list = Promise.all(sku_list.map(async (sku) => {
            await skuModel.findOneAndUpdate({
                sku_index: sku.sku_index,
                product_id: spu_id
            }, {
                ...sku,
                sku_name: product_name + createSkuName(product_variations, sku),
                sku_slug: slugify(product_name + createSkuName(product_variations, sku)),
            })
        }));
    }

    static async getOneSku({
        sku_id,
        product_id
    }) {
        //read cachhe

        const sku = await skuModel
            .findOne({
                _id: sku_id,
                product_id,
            })
            .lean();

        if (sku) {
            // setCache
        }
        return _.omit(sku, ['__v', 'isDeleted', 'updatedAt', 'createdAt']);
    }

    static async allSkuBySpu({
        product_id
    }) {
        const foundProduct = await spuModel
            .findOne({
                _id: product_id,
            })
            .lean();
        console.log(product_id);
        if (!foundProduct) throw new BadRequestError('Spu not exists');

        const allSku = await skuModel
            .find({
                product_id,
            })
            .lean();

        return allSku;
    }

    static async setDefaultSku({
        isDefault,
        sku_id
    }) {
        const foundSku = await findSkuById(sku_id);
        if (!foundSku) throw new BadRequestError('Not found sku');

        await skuModel.findByIdAndUpdate(sku_id, {
            sku_default: isDefault,
        });

        const foundParentSpu = await findSpuById(foundSku.product_id);
        if (!foundParentSpu) throw new BadRequestError('Not found SPU');

        await spuModel.findByIdAndUpdate(foundSku.product_id, {
            product_price: foundSku.sku_price,
        });
        return true;
    }


}