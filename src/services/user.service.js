import userModel from "../models/user.model.js"
import {
    ErrorResponse
} from '../core/error.response.js'

import {
    emailSendToken
} from "./email.service.js"
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

    console.log("res::", res)

    return {
        message: "success",
        metadata: {
            token: res
        }
    }

}

export {
    newUserService
}