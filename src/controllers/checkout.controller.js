import {
    SuccessResponse
} from "../core/success.response.js";
import CheckOutService from "../services/checkout.service.js";



class CheckOutController {
    checkoutPreview = async (req, res, next) => {
        new SuccessResponse({
            message: "checkk out preview ",
            metadata: await CheckOutService.checkOutRevew(req.body)
        }).send(res)
    }

    orderByUser = async (req, res, next) => {
        new SuccessResponse({
            message: "create order success",
            metadata: await CheckOutService.orderByUser(req.body)
        }).send(res)
    }

}
export default new CheckOutController();