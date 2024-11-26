import {
    TYPE_NOTIFICATION
} from "../../constant/index.js";

export function getNotificationContent(type) {
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