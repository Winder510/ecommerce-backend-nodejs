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
}
export default NotificationService