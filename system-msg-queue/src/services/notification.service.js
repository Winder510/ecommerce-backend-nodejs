import {
    TYPE_NOTIFICATION
} from "../constant.js";
import notificationModel from "../model/notification.model.js";
import {
    getAllActiceUser,
    getUserById
} from "./user.service.js";

// Xử lý thông báo cho từng cá nhân
export const processIndividualNotification = async (notificationData) => {
    try {
        // Kiểm tra user tồn tại
        const user = await getUserById(notificationData.recipientId);

        if (!user) {
            console.log(`User ${notificationData.recipientId} not found`);
            return;
        }

        // Gửi thông báo
        await pushNotifiToSystem({
            receivedId: user.id,
            type: notificationData.type,
            senderId: notificationData.senderId || 'system',
            options: notificationData.options
        });

        console.log(`Sent individual notification to user ${user.id}`);
    } catch (error) {
        console.error('Error in individual notification processing:', error);
        throw error;
    }
};

// Xử lý thông báo broadcast
export const processBroadcastNotification = async (notificationData) => {
    try {
        // Lấy danh sách tất cả user active
        const users = await getAllActiceUser();

        // Gửi thông báo cho từng user
        const notificationPromises = users.map(async (user) => {
            try {
                await pushNotifiToSystem({
                    receivedId: user._id,
                    type: notificationData.type,
                    senderId: notificationData.senderId || 'system',
                    options: notificationData.options
                });
            } catch (userNotificationError) {
                console.error(`Failed to send notification to user ${user.id}:`, userNotificationError);
            }
        });

        // Đợi tất cả thông báo được gửi
        await Promise.allSettled(notificationPromises);

        console.log(`Broadcast notification sent to ${users.length} users`);
    } catch (error) {
        console.error('Error in broadcast notification processing:', error);
        throw error;
    }
};

const pushNotifiToSystem = async ({
    type,
    receivedId,
    senderId,
    options = {}
}) => {
    let noti_content = getNotificationContent(type);

    const newNotification = await notificationModel.create({
        noti_type: type,
        noti_receivedId: receivedId,
        noti_options: options,
        noti_senderId: senderId,
        noti_content: noti_content,
        noti_isRead: false, // Mặc định là chưa đọc
    });
    return newNotification;
};


const sendRealTimeNotification = async (notification) => {
    try {
        // Gửi socket hoặc push notification
        // Ví dụ sử dụng socket.io
        // socketService.emitToUser(notification.noti_receivedId, 'new_notification', notification);
    } catch (error) {
        console.error('Error sending realtime notification:', error);
    }
}

function getNotificationContent(type) {
    let noti_content = '';

    switch (type) {
        case TYPE_NOTIFICATION.ORDER_SUCCESS:
            noti_content = 'Đơn hàng của bạn đã đặt thành công.';
            break;
        case TYPE_NOTIFICATION.ORDER_FAIL:
            noti_content = 'Đơn hàng của bạn không thành công. Vui lòng thử lại.';
            break;
        case TYPE_NOTIFICATION.ORDER_PENDING:
            noti_content = 'Đơn hàng của bạn đang chờ xử lý.';
            break;
        case TYPE_NOTIFICATION.ORDER_CONFIRMED:
            noti_content = 'Đơn hàng của bạn đã được xác nhận.';
            break;
        case TYPE_NOTIFICATION.ORDER_SHIPPED:
            noti_content = 'Đơn hàng của bạn đã được vận chuyển.';
            break;
        case TYPE_NOTIFICATION.ORDER_CANCELLED:
            noti_content = 'Đơn hàng của bạn đã bị hủy.';
            break;
        case TYPE_NOTIFICATION.PROMOTION_NEW:
            noti_content = 'Có khuyến mãi mới đang chờ bạn.';
            break;
        case TYPE_NOTIFICATION.PROMOTION_EXPIRE:
            noti_content = 'Khuyến mãi của bạn đã hết hạn.';
            break;
        default:
            noti_content = 'Loại thông báo không xác định.';
            break;
    }

    return noti_content;
}