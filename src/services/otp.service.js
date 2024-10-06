import crypto from 'crypto'
import otpModel from '../models/otp.model.js'
import {
    BadRequestError
} from '../core/error.response.js'
const generateTokenRandom = () => {
    const token = crypto.randomInt(2, Math.pow(2, 32))
    return token
}

const newOtp = async ({
    email
}) => {
    const token = generateTokenRandom()
    const newToken = await otpModel.create({
        otp_token: token,
        otp_email: email,

    })
    return newToken
}
const checkEmailToken = async ({
    token
}) => {
    const foundToken = await otpModel.findOne({
        otp_token: token
    }).lean()

    if (!foundToken) throw new BadRequestError("Token không hợp lệ")

    await otpModel.deleteOne({
        otp_token: token
    })

    console.log("found token :: ", foundToken)
    return foundToken

}
export {
    newOtp,
    checkEmailToken
}