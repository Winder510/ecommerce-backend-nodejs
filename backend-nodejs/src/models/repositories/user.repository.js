import userModel from '../user.model.js';

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
        usr_role,
    });
};
const findByEmail = async ({
    email
}) => {
    return await userModel
        .findOne({
            usr_email: email,
        })
        .select({
            usr_email: 1,
            usr_password: 1,
            usr_name: 1,
            usr_status: 1,
            usr_role: 1,
            usr_avatar: 1
        })
        .lean();
};

const findUserById = async (
    userId
) => {
    return await userModel
        .findById(
            userId
        )
        .select({
            usr_email: 1,
            usr_password: 1,
            usr_name: 1,
            usr_status: 1,
            usr_role: 1,
            usr_avatar: 1,
            usr_sex: 1,
            usr_date_of_birth: 1,
            usr_phone: 1,
            usr_loyalPoint: 1
        })
        .lean();
};
export {
    createUserRepo,
    findByEmail,
    findUserById
};