import spuModel from "../models/spu.model.js"
import {
    SkuService
} from "./sku.service.js"

export class SpuService {
    static newSPu = async ({
        name,
        description,
        thumb,
        price,
        categoryId,
        attributes,
        quanity,
        variations,
        sku_list = []
    }) => {

        const newSpu = await spuModel.create({
            product_name: name,
            product_description: description,
            product_thumb: thumb,
            product_price: price,
            product_categoryId: categoryId,
            product_attributes: attributes,
            product_quanity: quanity,
            product_variations: variations,

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
}