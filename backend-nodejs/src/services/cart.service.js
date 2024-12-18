import {
    Types
} from 'mongoose';
import {
    BadRequestError,
    NotFoundError
} from '../core/error.response.js';
import cartModel from '../models/cart.model.js';
import {
    addNewProductToCart,
    checkExistProduct,
    createUserCart,
    getProductInforForCart,
    replaceItemsInCart,
    updateUserCartQuantity,
} from '../models/repositories/cart.repo.js';
import {
    findSkuById,
} from '../models/repositories/sku.repo.js';


export class CartService {
    static async addToCartFromLocal({
        userId,
        carts = []
    }) {
        if (!carts.length) {
            throw new BadRequestError("Local cart is empty");
        }

        const results = [];

        for (const cartItem of carts) {
            const {
                skuId,
                quantity
            } = cartItem;

            try {
                const result = await this.addToCart({
                    userId,
                    skuId,
                    quantity
                });
                results.push({
                    skuId,
                    status: 'success',
                    message: 'Added successfully',
                    data: result
                });
            } catch (error) {
                results.push({
                    skuId,
                    status: 'error',
                    message: error.message
                });
            }
        }

        return results;
    }
    static async addToCart({
        userId,
        skuId,
        quantity
    }) {
        let product = await findSkuById(skuId);
        if (!product) throw new NotFoundError('Product not exists');

        if (product.sku_stock < quantity) throw new BadRequestError('Quantity is not enough');

        // check cart ton tai hay khong
        const userCart = await cartModel.findOne({
            cart_userId: userId,
        });

        if (!userCart) {
            return await createUserCart({
                userId,
                skuId,
                quantity
            });
        }

        if (
            await checkExistProduct({
                userId,
                skuId,
            })
        ) {
            return await updateUserCartQuantity({
                userId,
                skuId,
                quantity,
            });
        }
        return await addNewProductToCart({
            userId,
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
            skuId
        } = item_products;

        let product = await findSkuById(
            skuId
        );
        if (!product) throw new NotFoundError('Product not exists');

        if (product.sku_stock < quantity) throw new BadRequestError('Quantity is not enough');

        if (quantity === 0) {
            this.deleteUserCart({
                userId,
                skuId
            });
        }

        return await updateUserCartQuantity({
            userId,
            skuId,
            quantity: quantity - old_quantity,

        });
    }

    static async deleteUserCart({
        userId,
        skuId
    }) {
        const query = {
                cart_userId: userId,
                cart_state: 'active',
            },
            updateSet = {
                $pull: {
                    cart_products: {
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
        console.log("🚀 ~ CartService ~ userId:", userId)
        if (!userId) {
            throw new BadRequestError("You have signed out")
        }
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
                skuId,
                quantity
            } = item

            let data = await getProductInforForCart(skuId)

            return {
                ...data,
                quantity,
            }
        }));

        return items
    }

    static async replaceItemInCart({
        userId,
        oldSkuId,
        newSkuId,
    }) {
        const userCart = await cartModel.findOne({
            cart_userId: userId
        }).lean();
        if (!userCart) {
            throw new NotFoundError("Giỏ hàng không tồn tại");
        }

        let newProduct = await findSkuById(
            newSkuId
        );

        const itemIndex = userCart.cart_products.findIndex(item => item.skuId?.toString() === oldSkuId);
        if (itemIndex === -1) {
            throw new NotFoundError("Sản phẩm cũ không tồn tại trong giỏ hàng");
        }

        const currentQuantity = userCart.cart_products[itemIndex].quantity;

        if (currentQuantity > newProduct.product_quantity) throw new BadRequestError("Số lượng sản phầm không đủ")

        return await replaceItemsInCart({
            userId,
            oldSkuId,
            newSkuId,
        })

    }

    static async clearCart({
        userId
    }) {
        const cart = await cartModel.find({
            cart_userId: userId
        })
        cart.cart_products = []
        cart.save()
        return {
            success: true
        }
    }

    static async getCartByUserId({
        userId
    }) {
        return cartModel.findOne({
            cart_userId: new Types.ObjectId(userId)
        })
    }

    static getProductInforForLocal = async ({
        carts
    }) => {
        const items = await Promise.all(carts.map(async (item) => {
            const {
                skuId,
                quantity
            } = item

            let data = await getProductInforForCart(skuId)

            return {
                ...data,
                quantity,
            }
        }));

        return items
    }


}