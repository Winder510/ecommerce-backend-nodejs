import {
    CREATED,
    SuccessResponse
} from "../core/success.response.js";
import AccessService from "../services/access.service.js";

class AccessController {

    logout = async (req, res, next) => {
        let data = await AccessService.logout(req.keyStore);
        res.clearCookie('refresh_token');
        new SuccessResponse({
            message: "Logout success",
            metadata: data
        }).send(res)
    }

    login = async (req, res, next) => {
        let data = await AccessService.login(req.body);
        // set coookies
        if (data && data.tokens) {
            res.cookie("refresh_token", data.tokens.refreshToken, {
                httpOnly: true,
                maxAge: 60 * 60 * 1000,
            });
        }
        new SuccessResponse({
            message: 'login success',
            metadata: data
        }).send(res)
    }
    signup = async (req, res, next) => {
        let data = await AccessService.signUp(req.body);
        // set coookies
        if (data && data.tokens) {
            res.cookie("refresh_token", data.tokens.refreshToken, {
                httpOnly: true,
                maxAge: 60 * 60 * 1000,
            });
        }
        new CREATED({
            message: "Created success",
            metadata: data
        }).send(res)
    }
}
export default new AccessController();