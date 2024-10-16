import _ from "lodash"
import spuModel from "../models/spu.model.js"
import {
    SkuService
} from "./sku.service.js"
import {
    BadRequestError
} from "../core/error.response.js"
import {
    findListPublishSpuByCategory,
    publishSpu,
    searchSpuByUser,
    unPublishSpu
} from "../models/repositories/spu.repo.js"

export class SpuService {
    static newSPu = async ({
        name,
        description,
        thumb,
        categoryId,
        attributes,
        variations,
        discount_price,
        sku_list = []
    }) => {

        const product_quantity = sku_list.reduce((acc, sku) => {
            return acc + sku?.sku_stock
        }, 0)

        const defaultSku = sku_list.find(sku => sku.isDefault === true);
        if (!defaultSku) throw new BadRequestError("Can not find default sku")

        const newSpu = await spuModel.create({
            product_name: name,
            product_description: description,
            product_thumb: thumb,
            product_price: defaultSku?.sku_price,
            product_categoryId: categoryId,
            product_attributes: attributes,
            product_quantity,
            product_variations: variations,
            product_discount_price: discount_price
        })

        if (newSpu && sku_list.length) {
            // create skus
            await SkuService.newSku({
                spu_id: newSpu._id,
                sku_list
            })
        }

        // electice search


        return newSpu;

    }

    static async getOneSpu({
        _id
    }) {

        const foundSpu = await spuModel.findById(_id).lean()

        if (!foundSpu) throw new BadRequestError("Spu not exists")

        const sku_list = await SkuService.allSkuBySpu({
            product_id: _id
        })

        return {
            spu_info: _.omit(foundSpu, ['__v', 'isDeleted', 'updatedAt', 'createdAt']),
            sku_list: sku_list.map(sku => _.omit(sku, ['__v', 'isDeleted', 'updatedAt', 'createdAt']))
        }

    }

    static async getListPublishSpuByCategory({
        categoryId = null,
        limit = 10,
        skip = 0
    }) {
        const query = {
            isPublished: true,
            product_category: {
                $elemMatch: {
                    $eq: categoryId
                }
            }
        };

        return await findListPublishSpuByCategory({
            query,
            limit,
            skip
        })
    }

    static async getListDraftSpuByCategory({
        categoryId = null,
        limit = 10,
        skip = 0
    }) {
        const query = {
            isDraft: true,
            product_category: {
                $elemMatch: {
                    $eq: categoryId
                }
            }
        };

        return await findListPublishSpuByCategory({
            query,
            limit,
            skip
        })

    }

    static async publishSpu({
        product_id
    }) {
        return await publishSpu({
            product_id
        })
    }

    static async unPublishSpu({
        product_id
    }) {
        return await unPublishSpu({
            product_id
        })
    }

    static async searchSpu({
        keySearch
    }) {
        return await searchSpuByUser({
            keySearch
        })
    }

    static async getBestSoldSpu({
        categoryId,
        limit = 5,
        skip = 0
    }) {
        const query = {
            isPulished: true,
            product_category: {
                $elemMatch: {
                    $eq: categoryId
                }
            }
        }
        return await spuModel.find(query).sort({
            product_totalSold: -1
        }).skip(skip).limit(limit).lean().exec();
    }




}