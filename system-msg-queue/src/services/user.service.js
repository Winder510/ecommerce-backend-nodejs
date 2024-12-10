import userModel from "../model/user.model.js"

export const getUserById = async (userId) => {
    return await userModel.findById(userId).lean()
}

export const getAllActiceUser = async () => {
    return await userModel.find({
        usr_status: 'pending'
    }).lean()
}
export const addFavoriteProduct = async (userId, spuId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (user.usr_favorite.includes(spuId)) {
            return {
                message: 'Product is already in favorites'
            };
        }

        user.usr_favorite.push(spuId);
        await user.save();

        return {
            message: 'Product added to favorites successfully'
        };
    } catch (error) {
        console.error('Error adding favorite product:', error.message);
        throw error;
    }
};