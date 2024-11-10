import { CREATED, SuccessResponse } from '../core/success.response.js';
import AccessService from '../services/access.service.js';
import passport from '../configs/passport.config.js';

class AccessController {
    handleRefreshToken = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get token success',
            metadata: await AccessService.handleRefreshToken({
                refreshToken: req.refreshToken,
                user: req.user,
                keyStore: req.keyStore,
                res,
            }),
        }).send(res);
    };

    logout = async (req, res, next) => {
        let data = await AccessService.logout(req.keyStore);
        res.clearCookie('refresh_token');
        new SuccessResponse({
            message: 'Logout success',
            metadata: data,
        }).send(res);
    };

    login = async (req, res, next) => {
        new SuccessResponse({
            message: 'login success',
            metadata: await AccessService.login({
                ...req.body,
                res,
            }),
        }).send(res);
    };
}
export default new AccessController();
