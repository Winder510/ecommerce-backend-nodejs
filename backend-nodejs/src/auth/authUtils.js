import jwt from 'jsonwebtoken';
import {
    asyncErrorHandler
} from '../helpers/asyncHandler.js';
import {
    AuthFailureError,
    NotFoundError
} from '../core/error.response.js';
import KeyTokenService from '../services/keyToken.service.js';

export const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        const accessToken = await jwt.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '3 days',
        });
        const refreshToken = await jwt.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '7 days',
        });

        jwt.verify(accessToken, publicKey, (err, decode) => {
            if (err) {
                //  console.log("verify err::", err);
            } else {
                //console.log("decode varify::", decode);
            }
        });
        return {
            accessToken,
            refreshToken,
        };
    } catch (e) {}
};

function getAccessTokenFromHeader(req) {
    const authHeader = req.headers['authorization'];

    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1];
    } else {
        return null;
    }
}

// export const authentication = asyncErrorHandler(async (req, res, next) => {
//     const userId = req.headers['x-client-id'];
//     if (!userId) throw new AuthFailureError("Invalid request")

//     const accessToken = getAccessTokenFromHeader(req);
//     if (!accessToken) throw new AuthFailureError("Invalid request")

//     const keyStore = await KeyTokenService.findByUserId(userId);
//     if (!keyStore) throw new NotFoundError("Not found key store")

//     try {
//         const decodeUser = jwt.verify(accessToken, keyStore.publicKey)
//         if (userId !== decodeUser.userId) {
//             throw new AuthFailureError("Invalid userid ")
//         }
//         req.keyStore = keyStore;
//         return next()
//     } catch (e) {
//         throw e
//     }

// })
export const authenticationV2 = asyncErrorHandler(async (req, res, next) => {
    const userId = req.headers['x-client-id'];
    if (!userId) throw new NotFoundError('Invalid request');

    const keyStore = await KeyTokenService.findByUserId(userId);
    if (!keyStore) throw new NotFoundError('Not found key store');

    if (req.originalUrl === '/api/v1/auth/handleRefreshToken' && req.headers['refreshtoken']) {
        try {
            const refreshToken = req.headers['refreshtoken'];
            const decodeUser = jwt.verify(refreshToken, keyStore.publicKey);
            if (userId !== decodeUser.userId) {
                throw new AuthFailureError('Invalid userid ');
            }
            req.keyStore = keyStore;
            req.user = decodeUser;
            req.refreshToken = refreshToken;

            return next();
        } catch (e) {
            throw e;
        }
    }

    const accessToken = getAccessTokenFromHeader(req);
    if (!accessToken) throw new AuthFailureError('Invalid request');

    try {
        const decodeUser = jwt.verify(accessToken, keyStore.publicKey);
        if (userId !== decodeUser.userId) {
            throw new AuthFailureError('Invalid userid ');
        }
        req.user = decodeUser;
        req.keyStore = keyStore;

        return next();
    } catch (e) {
        console.log("🚀 ~ authenticationV2 ~ e:", e)
        throw new AuthFailureError("Lỗi JWT");
    }
});