import notificationModel from '../models/notification.model.js';
import {
    getNotificationContent
} from '../models/repositories/notification.repo.js';

class NotificationService {
    // static pushNotifiToSystem = async ({
    //     type,
    //     receivedId,
    //     senderId,
    //     options = {}
    // }) => {
    //     let noti_content = getNotificationContent(type);

    //     const newNoti = await notificationModel.create({
    //         noti_type: type,
    //         noti_receivedId: receivedId,
    //         noti_options: options,
    //         noti_senderId: senderId,
    //         noti_content,
    //     });

    //     return newNoti;
    // };

    static listNotiUser = async ({
        userId = 1,
        type = 'all',
        isRead = 0
    }) => {
        const match = {
            noti_receivedId: userId,
        };
        if (type !== 'all') {
            match['noti_type'] = type;
        }

        return await notificationModel.aggregate([{
                $match: match,
            },
            {
                $project: {
                    noti_type: 1,
                    noti_receivedId: 1,
                    noti_content: 1,
                    noti_options: 1,
                    noti_isRead: 1
                },
            },
        ]);
    };

    static markAsRead = async ({
        notificationId
    }) => {
        return await notificationModel.findByIdAndUpdate(
            notificationId, {
                noti_isRead: true
            }, {
                new: true
            } // Trả về tài liệu đã cập nhật
        );
    };

    // Hàm đánh dấu một thông báo là chưa đọc
    static markAsUnread = async ({
        notificationId
    }) => {
        return await notificationModel.findByIdAndUpdate(
            notificationId, {
                noti_isRead: false
            }, {
                new: true
            }
        );
    };

    // Hàm đánh dấu tất cả thông báo của người dùng là đã đọc
    static markAllAsRead = async ({
        userId
    }) => {
        return await notificationModel.updateMany({
            noti_receivedId: userId,
            noti_isRead: false
        }, {
            noti_isRead: true
        });
    };

    // Hàm đánh dấu tất cả thông báo của người dùng là chưa đọc
    static markAllAsUnread = async ({
        userId
    }) => {
        return await notificationModel.updateMany({
            noti_receivedId: userId,
            noti_isRead: true
        }, {
            noti_isRead: false
        });
    };
}
export default NotificationService;