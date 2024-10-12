import {
    TYPE_NOTIFICATION
} from "../constant/index.js";
import notificationModel from "../models/notification.model.js";

class NotificationService {
    static pushNotifiToSystem = async ({
        type = TYPE_NOTIFICATION.ORDER_001,
        recievedId = 1,
        options = {}
    }) => {
        let noti_content;

        if (type === TYPE_NOTIFICATION.ORDER_001) {
            noti_content = ` ... vừa mới thêm một sản phẩm: ... `
        } else if (type === TYPE_NOTIFICATION.PROMOTION_001) {
            noti_content = ` ... vừa mới thêm một voucher: ... `
        }

        const newNoti = await notificationModel.create({
            noti_type: type,
            noti_receivedId: recievedId,
            noti_options: options,
            noti_content
        })
        return newNoti;
    }

    static listNotiUser = async ({
        userId = 1,
        type = "all",
        isRead = 0
    }) => {
        const match = {
            noti_receivedId: userId
        }
        if (type !== 'all') {
            match['noti_type'] = type
        }

        return await notificationModel.aggregate([{
            $match: match
        }, {
            $project: {
                noti_type: 1,
                noti_receivedId: 1,
                noti_content: 1,
                noti_options: 1

            }
        }])
    }
}
export default NotificationService