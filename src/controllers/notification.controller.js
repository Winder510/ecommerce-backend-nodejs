import {
    SuccessResponse
} from "../core/success.response.js";
import NotificationService from "../services/notification.service.js";
class NotificationController {
    getListNoti = async (req, res, next) => {
        new SuccessResponse({
            message: "success",
            metadata: await NotificationService.listNotiUser(req.body)
        }).send(res)
    }
}
export default new NotificationController();