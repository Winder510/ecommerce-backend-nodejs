import {
    BadRequestError,
    NotFoundError
} from '../core/error.response.js';
import cartModel from '../models/cart.model.js';
import {
    addNewProductToCart,
    checkExistProduct,
    createUserCart,
    updateUserCartQuantity,
} from '../models/repositories/cart.repo.js';
import {
    getProductById
} from '../models/repositories/product.repo.js';
import {
    findProduct
} from '../models/repositories/spu.repo.js';
import spuModel from '../models/spu.model.js';

export class CartService {
    static async addToCart({
        userId,
        spuId,
        skuId,
        quantity
    }) {
        let product = await findProduct({
            skuId,
            spuId,
        });
        if (!product) throw new NotFoundError('Product not exists');
        if (product.product_quantity < quantity) throw new BadRequestError('Quantity is not enough');

        // check cart ton tai hay khong
        const userCart = await cartModel.findOne({
            cart_userId: userId,
        });

        if (!userCart) {
            return await createUserCart({
                userId,
                spuId,
                skuId,
                quantity
            });
        }

        if (
            await checkExistProduct({
                userId,
                spuId,
                skuId,
            })
        ) {
            return await updateUserCartQuantity({
                userId,
                spuId,
                skuId,
                quantity,
            });
        }
        return await addNewProductToCart({
            userId,
            spuId,
            skuId,
            quantity
        });
    }

    /**
                     * update cart
                     * 
                     * data {
                     *      item_product:
                     *          {
                     *              quantity,old_quantity,productId
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
        } = item_products;

        const foundProduct = await getProductById(productId);
        if (!foundProduct) throw new NotFoundError('Product not exists');

        if (quantity === 0) {
            this.deleteUserCart({
                userId,
                productId,
            });
        }

        return await updateUserCartQuantity({
            userId,
            product: {
                productId,
                quantity: quantity - old_quantity,
            },
        });
    }
    static async deleteUserCart({
        userId,
        productId
    }) {
        const query = {
                cart_userId: userId,
                cart_state: 'active',
            },
            updateSet = {
                $pull: {
                    cart_products: {
                        productId,
                    },
                },
            };

        const deleteCart = await cartModel.updateOne(query, updateSet);

        return deleteCart;
    }
    static async showCart({
        userId
    }) {
        const cart = await cartModel
            .findOne({
                cart_userId: userId,
            })
            .lean();

        if (!cart || !cart.cart_products || cart.cart_products.length === 0) {
            return {
                message: 'Giỏ hàng trống',
                cartItems: [],
            };
        }
        const productIds = cart.cart_products.map((item) => item.productId);

        const products = await spuModel
            .find({
                _id: {
                    $in: productIds,
                },
            })
            .select('')
            .lean();
    }
}