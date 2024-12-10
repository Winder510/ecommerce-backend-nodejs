import {
    SuccessResponse
} from '../core/success.response.js';

import {
    changePassWordService,
    checkLoginEmailTokenService,
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
}
export default new UserController();