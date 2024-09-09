import jwt from 'jsonwebtoken'

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
                //console.log("decode varify::", decode);

            }
        })
        return {
            accessToken,
            refreshToken
        }
    } catch (e) {

    }
}