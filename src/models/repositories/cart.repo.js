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