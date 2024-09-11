import shopModel from "../models/shop.model.js"

export const findByEmail = async ({
    email
}) => {
    return await shopModel.findOne({
        email
    }).select({
        email: 1,
        password: 1,
        name: 1,
        status: 1,
        roles: 1
    }).lean()
}