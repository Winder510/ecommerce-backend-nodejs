import mongoose from 'mongoose';
import cartModel from '../cart.model.js';
import promotionModel from '../promotion.model.js';
import {
    findSkuById
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


export const getProductInfor = async (skuId) => {
    const currentTime = new Date();

    const infor = await promotionModel.findOne({
        "products.productId": new mongoose.Types.ObjectId(skuId),
        status: "active",
        startTime: {
            $lte: currentTime
        },
        endTime: {
            $gte: currentTime
        },
    }, {
        "products.$": 1,
        "endTime": 1,
    });

    const sku = await findSkuById(skuId);

    if (!infor) {
        return {
            skuId,
            name: sku.sku_name,
            thumb: sku.sku_thumb,
            originalPrice: sku.sku_price,
            discount: 0,
            priceAfterDiscount: sku.sku_price,
        };
    }

    const {
        discountType,
        discountValue,
        quantityLimit,
        appliedQuantity,
    } = infor.products[0];

    const priceInfo = calDiscountPrice({
        originalPrice: sku.sku_price,
        discountType,
        discountValue,
        quantityLimit,
        appliedQuantity,
    });

    return {
        skuId,
        name: sku.sku_name,
        thumb: sku.sku_thumb,
        ...priceInfo,
        expireDiscountTime: infor.endTime,
    };
};

const calDiscountPrice = ({
    originalPrice,
    discountType,
    discountValue,
    quantityLimit,
    appliedQuantity,
}) => {
    let discount = 0;

    if (quantityLimit !== appliedQuantity || quantityLimit === -1) {
        discount = discountType === DISCOUNT_TYPE.PERCENTAGE ?
            (originalPrice * discountValue) : discountValue;
    }

    const priceAfterDiscount = originalPrice - discount;

    return {
        originalPrice,
        discount,
        priceAfterDiscount,
    };
};