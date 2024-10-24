import {
    BadRequestError,
    NotFoundError
} from '../core/error.response.js';
import cartModel from '../models/cart.model.js';
import {
    addNewProductToCart,
    checkExistProduct,
    createUserCart,
    replaceItemsInCart,
    updateUserCartQuantity,
} from '../models/repositories/cart.repo.js';

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
            spuId,
            skuId
        } = item_products;
        console.log({
            quantity,
            old_quantity,
            spuId,
            skuId
        })
        let product = await findProduct({
            skuId,
            spuId,
        });
        if (!product) throw new NotFoundError('Product not exists');
        if (product.product_quantity < quantity) throw new BadRequestError("Đã đạt đến số lượng tối đa")
        if (quantity === 0) {
            this.deleteUserCart({
                userId,
                spuId,
                skuId
            });
        }

        return await updateUserCartQuantity({
            userId,
            spuId,
            skuId,
            quantity: quantity - old_quantity,

        });
    }
    static async deleteUserCart({
        userId,
        spuId,
        skuId
    }) {
        const query = {
                cart_userId: userId,
                cart_state: 'active',
            },
            updateSet = {
                $pull: {
                    cart_products: {
                        spuId,
                        skuId
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

        const items = await Promise.all(cart.cart_products.map(async (item) => {
            const {
                spuId,
                skuId,
                quantity
            } = item

            const product = await findProduct({
                spuId,
                skuId
            })

            if (skuId) {
                return {
                    skuId: product._id,
                    spuId: product.product_id,
                    name: product.sku_name,
                    price: product.sku_price,
                    thumb: product.sku_thumb,
                    quantity,
                    totalPrice: product.sku_price * quantity
                }
            } else {
                return {
                    spuId: product._id,
                    name: product.product_name,
                    price: product.product_price,
                    thumb: product.product_thumb,
                    quantity,
                    totalPrice: product.product_price * quantity
                }
            }

        }));

        return items
    }

    static async replaceItemInCart({
        userId,
        spuId,
        oldSkuId,
        newSkuId,
    }) {
        const userCart = await cartModel.findOne({
            cart_userId: userId
        }).lean();
        if (!userCart) {
            throw new NotFoundError("Giỏ hàng không tồn tại");
        }

        const newProduct = await findProduct({
            spuId,
            skuId: newSkuId
        })

        const itemIndex = userCart.cart_products.findIndex(item => item.skuId?.toString() === oldSkuId);
        if (itemIndex === -1) {
            throw new NotFoundError("Sản phẩm cũ không tồn tại trong giỏ hàng");
        }

        const currentQuantity = userCart.cart_products[itemIndex].quantity;

        if (currentQuantity > newProduct.product_quantity) throw new BadRequestError("Số lượng sản phầm không đủ")

        return await replaceItemsInCart({
            userId,
            spuId,
            oldSkuId,
            newSkuId,
        })

    }


}