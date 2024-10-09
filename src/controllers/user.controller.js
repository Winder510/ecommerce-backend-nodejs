import {
    SuccessResponse
} from "../core/success.response.js"
import {
    createUserDto
} from "../dtos/request/user/createUser.dto.js"
import {
    changePassWordService,
    checkLoginEmailTokenService,
    newUserService
} from "../services/user.service.js"

class UserController {
    newUser = async (req, res, next) => {
        const respond = await newUserService({
            email: req.body.email
        })
        return new SuccessResponse(respond).send(res)
    }

    checkLoginEmailToken = async (req, res, next) => {
        const respond = await checkLoginEmailTokenService({
            token: req.query.token,
            res
        })

        return new SuccessResponse({
            message: "create new user",
            metadata: respond
        }).send(res)
    }


    getListUser = async (req, res, next) => {

    }

    deleteUser = async (req, res, next) => {

    }

    changePassword = async (req, res, next) => {
        console.log(req)
        return new SuccessResponse({
            message: "create new user",
            metadata: await changePassWordService({
                email: req.user.email,
                ...req.body
            })

        }).send(res)
    }
}
export default new UserController()