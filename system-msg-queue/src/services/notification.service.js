import notificationModel from "../model/notification.model.js";
import {
    getAllActiceUser,
    getUserById
} from "./user.service.js";
export const processIndividualNotification = async (notificationData) => {
    try {
        // {
        //     userId: 'user123',
        //     type: 'ORDER_PLACED',
        //     options: {
        //       orderId: 'order123',
        //       orderNumber: 'ORD123',
        //       totalAmount: 1000000,
        //       currency: 'VND',
        //       items: [...]
        //     }


        // Tạo notification theo model mới
        const notification = await createNotification({
            userId,
            type: notificationData.type,
            ...generateNotificationContent(notificationData)
        });

        // Gửi realtime notification nếu cần
        await sendRealTimeNotification(notification);

        console.log(`Sent individual notification to user ${user.id}`);
        return notification;
    } catch (error) {
        console.error('Error in individual notification processing:', error);
        throw error;
    }
};

export const processBroadcastNotification = async (notificationData) => {
    try {

        console.log("🚀 ~ notificationData:", notificationData)
        // type: 'PROMOTION_START',
        // options: {
        //   promoId: 'promo123',
        //   promoCode: 'SALE50',
        //   discountValue: 50,
        //   discountType: 'percentage',
        //   message: 'Siêu sale cuối năm!'

        // Lấy danh sách tất cả user active
        const users = await getAllActiceUser();
        console.log("🚀 ~ users:", users)

        // Gửi thông báo cho từng user
        const notificationPromises = users.map(async (user) => {
            try {
                const notification = await createNotification({
                    userId: user._id,
                    type: notificationData.type,
                    ...generateNotificationContent(notificationData)
                });

                // Gửi realtime notification
                await sendRealTimeNotification(notification);
                return notification;
            } catch (userNotificationError) {
                console.error(`Failed to send notification to user ${user.id}:`, userNotificationError);
                return null;
            }
        });

        const results = await Promise.allSettled(notificationPromises);
        const successCount = results.filter(result => result.status === 'fulfilled' && result.value).length;

        console.log(`Broadcast notification sent successfully to ${successCount}/${users.length} users`);
        return results;
    } catch (error) {
        console.error('Error in broadcast notification processing:', error);
        throw error;
    }
};

const createNotification = async (data) => {
    const notification = await notificationModel.create({
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        metadata: data.metadata,
        actionUrl: data.actionUrl,
        priority: data.priority || 'normal',
        isRead: false,
        isDelivered: false,
        expiresAt: data.expiresAt
    });
    return notification;
};

const generateNotificationContent = (data) => {
    let notificationContent = {
        title: '',
        message: '',
        actionUrl: '',
        metadata: {}
    };

    switch (data.type) {
        case 'ORDER_PLACED':
            notificationContent = {
                title: 'Đặt hàng thành công',
                message: 'Đơn hàng của bạn đã được đặt thành công.',
                actionUrl: `/profile/order-list/${data.options?.orderId}`,
                metadata: {
                    order: {
                        orderId: data.options?.orderId,
                        orderNumber: data.options?.orderNumber,
                        totalAmount: data.options?.totalAmount,
                        currency: data.options?.currency,
                        items: data.options?.items
                    }
                }
            };
            break;

        case 'ORDER_SHIPPED':
            notificationContent = {
                title: 'Đơn hàng đang vận chuyển',
                message: 'Đơn hàng của bạn đã được giao cho đơn vị vận chuyển.',
                actionUrl: `/profile/order-list/${data.options?.orderId}`,
                metadata: {
                    order: {
                        orderId: data.options?.orderId,
                        orderNumber: data.options?.orderNumber
                    }
                }
            };
            break;

        case 'PRICE_DROP':
            notificationContent = {
                title: 'Giảm giá sản phẩm',
                message: `${data.options?.productName} đã giảm giá!`,
                actionUrl: `/products/${data.options?.productId}`,
                metadata: {
                    product: {
                        productId: data.options?.productId,
                        productName: data.options?.productName,
                        oldPrice: data.options?.oldPrice,
                        newPrice: data.options?.newPrice,
                        discount: data.options?.discount,
                        imageUrl: data.options?.imageUrl
                    }
                }
            };
            break;

        case 'PROMOTION_START':
            notificationContent = {
                title: 'Khuyến mãi mới',
                message: data.options?.message || 'Khuyến mãi mới đang chờ bạn!',
                actionUrl: `/promotion/${data.options?.promoId}`,
                metadata: {
                    promotion: {
                        promoId: data.options?.promoId,
                        promoCode: data.options?.promoCode,
                        discountValue: data.options?.discountValue,
                        discountType: data.options?.discountType,
                        minPurchase: data.options?.minPurchase,
                        expiryDate: data.options?.expiryDate
                    }
                }
            };
            break;
        case 'COUPON_RECEIVED':
            notificationContent = {
                title: 'Voucher mới',
                message: data.options?.message || 'Voucher mới đang chờ bạn!',
                actionUrl: `/cart`,
                metadata: {
                    promotion: {
                        promoId: data.options?.promoId,
                        promoCode: data.options?.promoCode,
                        discountValue: data.options?.discountValue,
                        discountType: data.options?.discountType,
                        minPurchase: data.options?.minPurchase,
                        expiryDate: data.options?.expiryDate
                    }
                }
            };
            break;

        default:
            notificationContent = {
                title: 'Thông báo mới',
                message: data.options?.message || 'Bạn có thông báo mới',
                actionUrl: '/',
                metadata: {}
            };
    }

    return notificationContent;
};

const sendRealTimeNotification = async (notification) => {
    try {
        // Thực hiện gửi notification qua socket hoặc push notification
        // Ví dụ: socketService.emitToUser(notification.userId, 'new_notification', notification);

        // Cập nhật trạng thái đã gửi
        await notificationModel.findByIdAndUpdate(notification._id, {
            isDelivered: true
        });

    } catch (error) {
        console.error('Error sending realtime notification:', error);
        throw error;
    }
};