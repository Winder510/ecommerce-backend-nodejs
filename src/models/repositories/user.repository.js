import userModel from "../user.model.js"

const createUserRepo = async ({
    usr_name,
    usr_email,
    usr_password,
    usr_role
}) => {
    return await userModel.create({
        usr_name,
        usr_email,
        usr_password,
        usr_role
    })
}
const findByEmail = async ({
    email
}) => {
    return await userModel.findOne({
        usr_email: email
    }).select({
        usr_email: 1,
        usr_password: 1,
        usr_name: 1,
        usr_status: 1,
        usr_role: 1
    }).lean()
}
export {
    createUserRepo,
    findByEmail
}