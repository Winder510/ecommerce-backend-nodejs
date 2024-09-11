import jwt from 'jsonwebtoken'
import {
    asyncErrorHandler
} from '../helpers/asyncHandler.js'
import {
    AuthFailureError,
    NotFoundError
} from '../core/error.response.js'
import KeyTokenService from '../services/keyToken.service.js'

export const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        const accessToken = await jwt.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '2 days'
        })
        const refreshToken = await jwt.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '7 days'
        })

        jwt.verify(accessToken, publicKey, (err, decode) => {
            if (err) {
                //  console.log("verify err::", err);
            } else {
                console.log(">>>>>>>>>> publicKey>>>>>>", publicKey)
                console.log("decode varify::", decode);

            }
        })
        return {
            accessToken,
            refreshToken
        }
    } catch (e) {}
}

function getAccessTokenFromHeader(req) {
    const authHeader = req.headers['authorization'];

    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1];
    } else {
        return null;
    }
}

export const authentication = asyncErrorHandler(async (req, res, next) => {
    const userId = req.headers['x-client-id'];
    if (!userId) throw new AuthFailureError("Invalid request")

    const accessToken = getAccessTokenFromHeader(req);
    if (!accessToken) throw new AuthFailureError("Invalid request")

    const keyStore = await KeyTokenService.findByUserId(userId);
    if (!keyStore) throw new NotFoundError("Not found key store")
    console.log(">>>>>>>>>> publicKey>>>>>>", keyStore.publicKey)
    try {
        const decodeUser = jwt.verify(accessToken, keyStore.publicKey)
        if (userId !== decodeUser.userId) {
            throw new AuthFailureError("Invalid userid ")
        }
        req.keyStore = keyStore;
        return next()
    } catch (e) {
        throw e
    }

})