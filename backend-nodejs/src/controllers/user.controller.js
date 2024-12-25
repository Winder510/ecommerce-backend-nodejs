import {
    SuccessResponse
} from '../core/success.response.js';

import {
    addNewAddress,
    changePassWordService,
    checkLoginEmailTokenService,
    getDefaultAddress,
    getListAddress,
    getListUser,
} from '../services/user.service.js';

class UserController {
    checkLoginEmailToken = async (req, res, next) => {
        const respond = await checkLoginEmailTokenService({
            token: req.query.token,
            res,
        });
        // return new SuccessResponse({
        //     message: 'create new user',
        //     metadata: respond,
        // }).send(res);
    };

    getListUser = async (req, res, next) => {};

    deleteUser = async (req, res, next) => {};

    changePassword = async (req, res, next) => {
        return new SuccessResponse({
            message: 'create new user',
            metadata: await changePassWordService({
                email: req.user.email,
                ...req.body,
            }),
        }).send(res);
    };

    addNewUserAddress = async (req, res, next) => {
        return new SuccessResponse({
            message: 'add new user address',
            metadata: await addNewAddress({
                ...req.body,
            }),
        }).send(res);
    };

    getUserAddress = async (req, res, next) => {
        return new SuccessResponse({
            message: 'add new user address',
            metadata: await getListAddress({
                ...req.params
            }),
        }).send(res);
    };

    getUserDefaultAddress = async (req, res, next) => {
        return new SuccessResponse({
            message: 'add new user address',
            metadata: await getDefaultAddress({
                ...req.params
            }),
        }).send(res);
    };

    getListUserForAddmin = async (req, res, next) => {
        return new SuccessResponse({
            message: 'add new user address',
            metadata: await getListUser(),
        }).send(res);
    };

    updateUserProfile = async (req, res, next) => {
        try {
            const {
                id
            } = req.user.userId; // ID của người dùng từ route
            const {
                usr_name,
                usr_phone,
                usr_email,
                usr_img
            } = req.body;

            // Gọi service để thực hiện cập nhật
            const updatedUser = await updateProfileService({
                id,
                usr_name,
                usr_phone,
                usr_email,
                usr_img,
            });

            // Trả về kết quả sau khi cập nhật
            return new SuccessResponse({
                message: "Profile updated successfully",
                metadata: updatedUser,
            }).send(res);
        } catch (error) {
            next(error);
        }
    };

}
export default new UserController();