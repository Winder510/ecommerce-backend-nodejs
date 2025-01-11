// !dmbg
import mongoose from 'mongoose'; // Erase if already required

const COLLECTION_NAME = 'Notifications';
const DOCUMENT_NAME = 'Notification';
// Declare the Schema of the Mongo model
var notificationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },

    // Phân loại notification
    type: {
        type: String,
        required: true,
        enum: [
            // Đơn hàng
            'ORDER_PLACED', // Đặt hàng thành công
            'ORDER_CONFIRMED', // Đơn hàng được xác nhận
            'ORDER_PROCESSING', // Đang xử lý đơn hàng
            'ORDER_SHIPPED', // Đơn hàng đang vận chuyển
            'ORDER_DELIVERED', // Đơn hàng đã giao
            'ORDER_CANCELLED', // Đơn hàng bị hủy
            'ORDER_REFUNDED', // Hoàn tiền

            // Thanh toán
            'PAYMENT_PENDING', // Chờ thanh toán
            'PAYMENT_SUCCESS', // Thanh toán thành công
            'PAYMENT_FAILED', // Thanh toán thất bại

            // Sản phẩm
            'PRICE_DROP', // Giảm giá sản phẩm trong wishlist
            'BACK_IN_STOCK', // Sản phẩm có hàng trở lại
            'PRODUCT_REVIEW', // Đánh giá sản phẩm

            // Khuyến mãi
            'COUPON_RECEIVED', // Nhận mã giảm giá
            'COUPON_EXPIRING', // Mã giảm giá sắp hết hạn
            'PROMOTION_START', // Bắt đầu khuyến mãi

            // Tài khoản
            'ACCOUNT_CREDIT', // Nhận điểm thưởng/credit
            'REWARD_EARNED', // Đạt mốc rewards
            'LEVEL_UP', // Thăng hạng thành viên
        ]
    },

    // Tiêu đề thông báo
    title: {
        type: String,
        required: true,
    },

    // Nội dung chi tiết
    message: {
        type: String,
        required: true
    },

    // Metadata tùy theo loại notification
    metadata: {
        // Thông tin đơn hàng
        order: {
            orderId: String,
            orderNumber: String,
            totalAmount: Number,
            currency: String,
            items: [{
                productId: String,
                productName: String,
                quantity: Number,
                price: Number
            }]
        },

        // Thông tin thanh toán
        payment: {
            paymentId: String,
            amount: Number,
            currency: String,
            method: String,
            status: String
        },

        // Thông tin sản phẩm
        product: {
            productId: String,
            productName: String,
            oldPrice: Number,
            newPrice: Number,
            discount: Number,
            imageUrl: String
        },

        // Thông tin khuyến mãi
        promotion: {
            promoId: String,
            promoCode: String,
            discountValue: Number,
            discountType: String, // percentage/fixed
            minPurchase: Number,
            expiryDate: Date
        },

        // Thông tin rewards/credits
        reward: {
            points: Number,
            creditAmount: Number,
            reason: String,
            newTotal: Number,
            newLevel: String
        }
    },

    // Link điều hướng khi click vào notification
    actionUrl: {
        type: String,
        required: true
    },

    // Trạng thái đọc
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },

    // Trạng thái gửi realtime notification
    isDelivered: {
        type: Boolean,
        default: false
    },

    // Độ ưu tiên của notification
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal'
    },

    // Thời gian thông báo hết hạn (nếu có)
    expiresAt: {
        type: Date
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

export default mongoose.model(DOCUMENT_NAME, notificationSchema);