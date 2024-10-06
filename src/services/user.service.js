import userModel from "../models/user.model.js"
import {
    BadRequestError,
    ErrorResponse
} from '../core/error.response.js'

import {
    emailSendToken
} from "./email.service.js"
import {
    checkEmailToken
} from "./otp.service.js"
const newUserService = async ({
    email = null
}) => {
    const user = await userModel.findOne({
        usr_email: email
    }).lean()

    if (user) throw new ErrorResponse("Email is exists")

    // send token in email
    const res = await emailSendToken({
        email
    })

    return {
        message: "success",
        metadata: {
            token: res
        }
    }

}

const checkLoginEmailTokenService = async ({
    token
}) => {
    const {
        otp_email: email,
        otp_token
    } = await checkEmailToken({
        token
    })
    if (!email) throw new BadRequestError("Token not found ")

    const hasuser = await findUserEmail(email)
    if (hasuser) throw new BadRequestError("Email is exists")

    /// 
    // const passwordHash = await bcrypt.hash(password, 10);

    // const newShop = await shopModel.create({
    //     name,
    //     email,
    //     password: passwordHash,
    //     roles: [RoleShop.ADMIN]
    // })
    // if (newShop) {
    //     const {
    //         publicKey,
    //         privateKey
    //     } = crypto.generateKeyPairSync('rsa', {
    //         modulusLength: 4096,
    //         publicKeyEncoding: {
    //             type: "pkcs1",
    //             format: "pem",
    //         },
    //         privateKeyEncoding: {
    //             type: "pkcs1",
    //             format: "pem",
    //         },
    //     });
    //     const tokens = await createTokenPair({
    //         userId: newShop._id,
    //         email
    //     }, publicKey, privateKey);

    //     // set cookies cho client
    //     res.cookie("refresh_token", tokens.refreshToken, {
    //         httpOnly: true,
    //         maxAge: 60 * 60 * 1000,
    //     });

    //     await KeyTokenService.upsertKeyToken({
    //         userId: newShop._id,
    //         publicKey,
    //         refreshToken: tokens.refreshToken
    //     });
    //     return {
    //         shop: getInfoData({
    //             fields: ["_id", "name", "email"],
    //             object: newShop
    //         }),
    //         accessToken: tokens.accessToken
    //     }
    // }
    // return {
    //     metadata: null,
    // }

}

const findUserEmail = async (email) => {
    const user = await userModel.findOne({
        usr_email: email
    }).lean()

    return user
}
export {
    newUserService
}