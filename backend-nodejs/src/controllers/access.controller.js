import {
    CREATED,
    SuccessResponse
} from '../core/success.response.js';
import AccessService from '../services/access.service.js';
import passport from '../configs/passport.config.js';
import {
    getInfoData,
    validateEmail
} from '../utils/index.js';
import {
    newUserService
} from '../services/user.service.js';
import {
    createTokenPair
} from '../auth/authUtils.js';
import KeyTokenService from '../services/keyToken.service.js';
import crypto from 'crypto';
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

    signin = async (req, res, next) => {
        new SuccessResponse({
            message: 'login success',
            metadata: await AccessService.login({
                ...req.body,
                res,
            }),
        }).send(res);
    };

    signup = async (req, res, next) => {
        if (!validateEmail(req.body?.email)) {
            throw new BadRequestError('Email không đúng định dạng');
        }
        const respond = await newUserService({
            email: req.body.email,
        });
        return new SuccessResponse(respond).send(res);
    };

    async googleLogin(req, res, next) {
        passport.authenticate('google', {
            scope: ['profile', 'email']
        })(req, res);
    }

    async googleCallback(req, res) {
        passport.authenticate('google', {
            failureRedirect: '/'
        })(req, res, async () => {
            try {
                const foundUser = req.user;

                const {
                    publicKey,
                    privateKey
                } = crypto.generateKeyPairSync('rsa', {
                    modulusLength: 4096,
                    publicKeyEncoding: {
                        type: 'pkcs1',
                        format: 'pem',
                    },
                    privateKeyEncoding: {
                        type: 'pkcs1',
                        format: 'pem',
                    },
                });

                const tokens = await createTokenPair({
                        userId: foundUser._id,
                        email: user.usr_email,
                        phone: foundUser.usr_phone,
                        role: foundUser.usr_role,
                    },
                    publicKey,
                    privateKey,
                );

                // set cookies cho client
                res.cookie('refresh_token', tokens.refreshToken, {
                    httpOnly: true,
                    maxAge: 60 * 60 * 1000,
                });

                await KeyTokenService.upsertKeyToken({
                    userId: foundUser._id,
                    publicKey,
                    refreshToken: tokens.refreshToken,
                });

                // return res.json({
                //     user: getInfoData({
                //         fields: ['_id', 'usr_name', 'usr_email'],
                //         object: foundUser,
                //     }),
                //     tokens,
                // });

                return res.redirect(`http://localhost:5173/?user=${foundUser._id}&token=${tokens.accessToken}`);

            } catch (err) {
                res.status(500).send('Something went wrong');
            }
        });
    }

    getAccount = async (req, res, next) => {
        new SuccessResponse({
            message: 'login success',
            metadata: await AccessService.getAccount(req.user),
        }).send(res);
    };

}
export default new AccessController();