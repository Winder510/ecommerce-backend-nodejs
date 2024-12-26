import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import KeyTokenService from './keyToken.service.js';
import {
    createTokenPair
} from '../auth/authUtils.js';
import {
    getInfoData
} from '../utils/index.js';
import {
    AuthFailureError,
    BadRequestError
} from '../core/error.response.js';
import {
    findByEmail,
    findUserById
} from '../models/repositories/user.repository.js';

class AccessService {
    static handleRefreshToken = async ({
        refreshToken,
        user,
        keyStore,
        res
    }) => {
        if (keyStore.refreshToken !== refreshToken) {
            throw new AuthFailureError('user not registed');
        }

        const foundUser = await findByEmail({
            email: user.email,
        });

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
            maxAge: 60 * 60 * 10000,
        });

        await KeyTokenService.upsertKeyToken({
            userId: foundUser._id,
            publicKey,
            refreshToken: tokens.refreshToken,
        });

        return {
            user: getInfoData({
                fields: ['_id', 'usr_name', 'usr_email', 'usr_avatar', "usr_phone", 'usr_role', "usr_sex", "usr_date_of_birth", "usr_loyalPoint"],
                object: foundUser,
            }),
            accessToken: tokens.accessToken,
        };
    };

    static async logout(keyStore) {
        return await KeyTokenService.removeKeyById(keyStore._id);
    }

    static async login({
        email,
        password,
        res
    }) {
        const foundUser = await findByEmail({
            email,
        });
        if (!foundUser) throw new BadRequestError('User is not registered');

        const match = await bcrypt.compare(password, foundUser.usr_password);
        if (!match) throw new AuthFailureError('Authentication error');

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
                email: foundUser.usr_email,
                phone: foundUser.usr_phone,
                role: foundUser.usr_role,
            },
            publicKey,
            privateKey,
        );

        // set cookies cho client
        res.cookie('refresh_token', tokens.refreshToken, {
            maxAge: 60 * 60 * 10000,
        });

        await KeyTokenService.upsertKeyToken({
            userId: foundUser._id,
            publicKey,
            refreshToken: tokens.refreshToken,
        });
        return {
            user: getInfoData({
                fields: ['_id', 'usr_name', 'usr_email', 'usr_avatar', "usr_phone", 'usr_role', "usr_sex", "usr_date_of_birth", "usr_loyalPoint"],
                object: foundUser,
            }),
            // accessToken: tokens.accessToken
            tokens,
        };
    }

    static async getAccount({
        userId
    }) {
        const foundUser = await findUserById(userId);
        return foundUser
    }
}
export default AccessService;