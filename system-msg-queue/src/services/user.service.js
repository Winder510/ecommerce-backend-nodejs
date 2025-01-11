import userModel from "../model/user.model.js"

export const getUserById = async (userId) => {
    return await userModel.findById(userId).lean()
}

export const getAllActiceUser = async () => {
    return await userModel.find({
        usr_status: 'active'
    }).lean()
}