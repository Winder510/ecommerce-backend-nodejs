import {
    CREATED,
    SuccessResponse
} from "../core/success.response.js";

let data = {
    phong: 123,
    tẻo: 123,
    linh: 123
}
class ProfileController {
    testRBCA = async (req, res, next) => {
        new SuccessResponse({
            message: "Create new product success",
            metadata: data
        }).send(res)
    }

}
export default new ProfileController();