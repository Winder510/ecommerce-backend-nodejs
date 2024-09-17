import {
    BadRequestError
} from "../core/error.response.js"
import {
    iPhoneModel,
    macModel,
    productModel
} from "../models/product.model.js"
import {
    findAllDraftProductForShop,
    findAllProducts,
    findAllPublishProductForShop,
    findProduct,
    publishProduct,
    searchProductByUser,
    unPublishProduct,
    updateProductById
} from "../models/repositories/product.repo.js";
import {
    removeUndefinedNullObject
} from "../utils/index.js";

export default class ProductFactory {
    // static async createProduct(type, payload) {
    //     switch (type) {
    //         case "iPhone":
    //             return new iPhone(payload).createProduct();
    //         case "Mac":
    //             return new Mac(payload).createProduct();
    //         default:
    //             throw new BadRequestError(`Invalid product type: ${type}`)
    //     }
    // }

    static productRegister = {}

    static registerproductType(type, classRef) {
        ProductFactory.productRegister[type] = classRef;
    }

    static async createProduct(type, payload) {
        const productClass = ProductFactory.productRegister[type]
        if (!productClass) throw new BadRequestError(`Invalid product type: ${type}`)

        return new productClass(payload).createProduct()
    }

    static async findAllDraftProductForShop(
        limit = 10,
        skip = 0
    ) {
        const query = {
            isDraft: true
        }
        console.log(limit, skip)
        return await findAllDraftProductForShop({
            query,
            limit,
            skip
        })
    }

    static async findAllPublishProductForShop(
        limit = 10,
        skip = 0
    ) {
        const query = {
            isPublished: true
        }
        return await findAllPublishProductForShop({
            query,
            limit,
            skip
        })
    }

    static async publishProduct({
        product_id
    }) {
        return await publishProduct({
            product_id
        })
    }

    static async unPublishProduct({
        product_id
    }) {
        return await unPublishProduct({
            product_id
        })
    }

    static async searchProduct({
        keySearch
    }) {
        return await searchProductByUser({
            keySearch
        })
    }

    static async findAllProducts({
        limit = 50,
        sort = 'ctime',
        page = 1,
        filter = {
            isPublished: true
        },
        select
    }) {
        return await findAllProducts({
            limit,
            sort,
            filter,
            select: ['product_name', 'product_description', "product_price"]
        })
    }
    static async findProduct({
        product_id
    }) {
        return await findProduct({
            product_id,
            unSelect: ['__v']
        })
    }


    static async updateProduct(type, product_id, payload) {
        const productClass = ProductFactory.productRegister[type]
        if (!productClass) throw new BadRequestError(`Invalid product type: ${type}`)

        return new productClass(payload).updateProduct(product_id)
    }
}

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
    async createProduct(_id) {
        return await productModel.create({
            ...this,
            _id
        })
    }

    //update product
    async updatProduct(product_id, payload) {
        return await updateProductById({
            product_id,
            payload,
            model: productModel
        })
    }
}
class iPhone extends Product {
    async createProduct() {
        const newIphone = await iPhoneModel.create(this.product_attributes)
        if (!newIphone) throw BadRequestError("Create new iphone error")

        const newProDuct = await super.createProduct(newIphone._id)
        if (!newProDuct) throw BadRequestError("Create new product error")

        return newProDuct;
    }

    async updateProduct(product_id) {
        const objProduct = removeUndefinedNullObject(this)


        if (this.product_attributes) {
            await updateProductById({
                product_id,
                payload: objProduct,
                model: iPhoneModel
            })
        }
        const updateProduct = await super.updatProduct(product_id, objProduct)
        return updateProduct
    }
}
class Mac extends Product {
    async createProduct() {
        const newMac = await macModel.create(this.product_attributes)
        if (!newMac) throw BadRequestError("Create new Mac error")

        const newProDuct = await super.createProduct(newMac._id)
        if (!newProDuct) throw BadRequestError("Create new product error")

        return newProDuct;
    }

    async updateProduct(product_id) {
        const objProduct = removeUndefinedNullObject(this)


        if (this.product_attributes) {
            await updateProductById({
                product_id,
                payload: objProduct,
                model: macModel
            })
        }
        const updateProduct = await super.updatProduct(product_id, objProduct)
        return updateProduct
    }
}

// register product type

ProductFactory.registerproductType("iPhone", iPhone)
ProductFactory.registerproductType("Mac", Mac)