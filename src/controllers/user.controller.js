import {
    SuccessResponse
} from "../core/success.response.js"
import {
    newUserService
} from "../services/user.service.js"

class UserController {
    newUser = async (req, res, next) => {
        const respond = await newUserService({
            email: req.body.email
        })
        return new SuccessResponse(respond).send(res)
    }

    checkRegsiterEmailToken = async (req, res, next) => {

    }


    getListUser = async (req, res, next) => {

    }

    deleteUser = async (req, res, next) => {

    }
}
export default new UserController()