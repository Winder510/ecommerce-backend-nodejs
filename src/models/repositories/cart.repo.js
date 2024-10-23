import cartModel from '../cart.model.js';

export const createUserCart = async ({
    userId,
    spuId,
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
                    spuId,
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
    spuId,
    skuId,
    quantity
}) => {
    const query = {
            cart_userId: userId,
            cart_state: 'active',
            'cart_products.spuId': spuId,
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

// Hàm để thêm sản phẩm mới vào giỏ hàng
export const addNewProductToCart = async ({
    userId,
    spuId,
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
                    spuId,
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
    spuId,
    skuId,
    userId
}) => {
    const existingCart = await cartModel
        .findOne({
            cart_userId: userId,
            cart_state: 'active',
            'cart_products.spuId': spuId,
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