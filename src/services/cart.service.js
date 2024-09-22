import {
    NotFoundError
} from "../core/error.response.js";
import cartModel from "../models/cart.model.js";
import {
    addNewProductToCart,
    checkExistProduct,
    createUserCart,
    updateUserCartQuantity,
} from "../models/repositories/cart.repo.js";
import {
    getProductById
} from "../models/repositories/product.repo.js";

export class CartService {
    static async addToCart({
        userId,
        product = {} // "productId": "66e69cc55d88ce1a18535ff5",  "quantity": 12
    }) {
        const foundProduct = await getProductById(product?.productId)
        if (!foundProduct) throw new NotFoundError("Product not exists")

        product.name = foundProduct.product_name;
        product.price = foundProduct.product_price;

        // check cart ton tai hay khong
        const userCart = await cartModel.findOne({
            cart_userId: userId
        })

        if (!userCart) {
            return await createUserCart({
                userId,
                product
            })
        }

        if (await checkExistProduct({
                userId,
                productId: product.productId
            })) {
            return await updateUserCartQuantity({
                userId,
                product
            })

        }
        return await addNewProductToCart({
            userId,
            product
        })

    }

    /**
     * update cart
     * 
     * data {
     *      item_product:
     *          {
     *              quantity, price,old_quantity,productId
     *          }
     *      
     *      versions

     * }
     */

    static async addToCartV2({
        userId,
        item_products
    }) {
        const {
            quantity,
            old_quantity,
            productId
        } = item_products


        const foundProduct = await getProductById(productId)
        if (!foundProduct) throw new NotFoundError("Product not exists")

        if (quantity === 0) {
            this.deleteUserCart({
                userId,
                productId
            })
        }

        return await updateUserCartQuantity({
            userId,
            product: {
                productId,
                quantity: quantity - old_quantity,

            }
        })
    }
    static async deleteUserCart({
        userId,
        productId
    }) {
        const query = {
                cart_userId: userId,
                cart_state: 'active'
            },
            updateSet = {
                $pull: {
                    cart_products: {
                        productId
                    }
                }
            }

        const deleteCart = await cartModel.updateOne(query, updateSet)

        return deleteCart
    }
    static async getListUserCart({
        userId
    }) {
        return await cartModel.findOne({
            cart_userId: userId
        }).lean()
    }
}