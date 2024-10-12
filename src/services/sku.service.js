import skuModel from "../models/sku.model.js";
import {
    randomNummber
} from '../utils/index.js'
export class SkuService {
    static async newKsu({
        spu_id,
        sku_list
        /**
         *  variations:[
                {
                    name: color ,
                    options: [red,blue]
                },
                {
                    name: size ,
                    options: [XL,S]
                }
            ]
         */
    }) {
        const convevt_sku_list = sku_list.map(sku => {
            return {
                ...sku,
                product_id: spu_id,
                sku_id: `${product_id}. ${randomNummber()}`
            }
        })
        const newSkus = skuModel.create(
            convevt_sku_list
        )

        return newSkus
    }
}