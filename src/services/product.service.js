import {
    BadRequestError
} from "../core/error.response.js"
import {
    iPhoneModel,
    macModel,
    productModel
} from "../models/product.model.js"

export default class ProductFactory {
    static async createProduct(type, payload) {
        switch (type) {
            case "iPhone":
                return new iPhone(payload).createProduct();
            case "Mac":
                return new Mac(payload).createProduct();
            default:
                throw new BadRequestError(`Invalid product type: ${type}`)
        }
    }
}
/**
 * 
 *   product_name: {
 
    product_thumb: {
    
    product_description: {
  
    product_price: {
      
    product_quantity: {
       
    product_type: {
      
    product_attributes: {
     
 */
class Product {
    constructor({
        product_name,
        product_thumb,
        product_description,
        product_price,
        product_quantity,
        product_type,
        product_attributes
    }) {
        this.product_name = product_name
        this.product_thumb = product_thumb
        this.product_description = product_description
        this.product_price = product_price
        this.product_quantity = product_quantity
        this.product_type = product_type
        this.product_attributes = product_attributes
    }

    // create new product
    async createProduct() {
        return await productModel.create(this)
    }
}
class iPhone extends Product {
    async createProduct() {
        const newIphone = await iPhoneModel.create(this.product_attributes)
        if (!newIphone) throw BadRequestError("Create new iphone error")

        const newProDuct = await super.createProduct()
        if (!newProDuct) throw BadRequestError("Create new product error")

        return newProDuct;


    }
}
class Mac extends Product {
    async createProduct() {
        const newMac = await macModel.create(this.product_attributes)
        if (!newMac) throw BadRequestError("Create new Mac error")

        const newProDuct = await super.createProduct()
        if (!newProDuct) throw BadRequestError("Create new product error")

        return newProDuct;


    }
}