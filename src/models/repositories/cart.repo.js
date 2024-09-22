import cartModel from "../cart.model.js"

export const createUserCart = async ({
    userId,
    product
}) => {
    const query = {
            cart_userId: userId,
            cart_state: 'active'
        },
        updateOrInsert = {
            $addToSet: {
                cart_products: product
            }
        },
        options = {
            upsert: true,
            new: true
        }
    return await cartModel.findOneAndUpdate(query, updateOrInsert, options).lean()
}

export const updateUserCartQuantity = async ({
    userId,
    product
}) => {
    const {
        productId,
        quantity
    } = product
    console.log({
        productId,
        quantity
    })
    const query = {
            cart_userId: userId,
            cart_state: 'active',
            'cart_products.productId': productId
        },
        updateSet = {
            $inc: {
                'cart_products.$.quantity': quantity
            }
        },
        options = {
            upsert: true,
            new: true
        }

    return await cartModel.findOneAndUpdate(query, updateSet, options).lean()
}

// Hàm để thêm sản phẩm mới vào giỏ hàng
export const addNewProductToCart = async ({
    userId,
    product
}) => {
    return await cartModel.findOneAndUpdate({
        cart_userId: userId,
        cart_state: 'active'
    }, {
        $push: {
            cart_products: product
        }
    }, {
        new: true,
        upsert: true
    }).lean();
};

export const checkExistProduct = async ({
    productId,
    userId
}) => {
    console.log(productId, userId)
    const existingCart = await cartModel.findOne({
        cart_userId: userId,
        cart_state: 'active',
        'cart_products.productId': productId
    }).lean();

    return existingCart

}
export const findCartById = async ({
    cartId
}) => {
    return await cartModel.findOne({
        _id: cartId
    }).lean()
}