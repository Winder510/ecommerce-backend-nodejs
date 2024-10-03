import crypto from 'crypto'
import otpModel from '../models/otp.model.js'
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

export {
    newOtp
}