import mongoose from 'mongoose';
import cartModel from '../cart.model.js';
import promotionModel from '../promotion.model.js';
import {
    findSkuById,
    getPriceSku
} from './sku.repo.js';
import {
    DISCOUNT_TYPE
} from '../../constant/index.js';

export const createUserCart = async ({
    userId,
    skuId,
    quantity
}) => {
    const query = {
            cart_userId: userId,
            cart_state: 'active',
        },
        updateOrInsert = {
            $addToSet: {
                cart_products: {
                    skuId,
                    quantity
                },
            },
        },
        options = {
            upsert: true,
            new: true,
        };
    return await cartModel.findOneAndUpdate(query, updateOrInsert, options).lean();
};

export const updateUserCartQuantity = async ({
    userId,
    skuId,
    quantity
}) => {
    const query = {
            cart_userId: userId,
            cart_state: 'active',
            'cart_products.skuId': skuId,
        },
        updateSet = {
            $inc: {
                'cart_products.$.quantity': quantity,
            },
        },
        options = {
            upsert: true,
            new: true,
        };

    return await cartModel.findOneAndUpdate(query, updateSet, options).lean();
};

export const replaceItemsInCart = async ({
    userId,
    spuId,
    oldSkuId,
    newSkuId,
}) => {
    const query = {
        cart_userId: userId,
        cart_state: 'active',
        'cart_products.skuId': oldSkuId,
    };

    const updateSet = {
        $set: {
            'cart_products.$.skuId': newSkuId,
        },
    };

    const options = {
        new: true,
    };

    const updatedCart = await cartModel.findOneAndUpdate(query, updateSet, options).lean();
    return updatedCart;
};


// Hàm để thêm sản phẩm mới vào giỏ hàng
export const addNewProductToCart = async ({
    userId,
    skuId,
    quantity
}) => {
    return await cartModel
        .findOneAndUpdate({
            cart_userId: userId,
            cart_state: 'active',
        }, {
            $push: {
                cart_products: {
                    skuId,
                    quantity
                },
            },
        }, {
            new: true,
            upsert: true,
        }, )
        .lean();
};

export const checkExistProduct = async ({
    skuId,
    userId
}) => {
    const existingCart = await cartModel
        .findOne({
            cart_userId: userId,
            cart_state: 'active',
            'cart_products.skuId': skuId,
        })
        .lean();

    return existingCart;
};
export const findCartById = async ({
    cartId
}) => {
    return await cartModel
        .findOne({
            _id: cartId,
        })
        .lean();
};


export const getProductInforForCart = async (skuId) => {
    const sku = await findSkuById(skuId);
    const {
        originalPrice,
        discountValue,
        priceAfterDiscount
    } = getPriceSku(skuId)

    return {
        skuId,
        name: sku.sku_name,
        thumb: sku.sku_thumb,
        originalPrice: sku.sku_price,
        discount: discountValue,
        priceAfterDiscount,
        loyalPoint: sku.sku_price * sku.loyalPointRate,
    };

};