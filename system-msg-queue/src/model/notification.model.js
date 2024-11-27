// !dmbg
import mongoose from 'mongoose'; // Erase if already required
import {
    TYPE_NOTIFICATION
} from '../constant.js';

const COLLECTION_NAME = 'Notifications';
const DOCUMENT_NAME = 'Notification';
// Declare the Schema of the Mongo model
var notificationSchema = new mongoose.Schema({
    noti_type: {
        type: String,
        enum: [TYPE_NOTIFICATION.PROMOTION_EXPIRE, TYPE_NOTIFICATION.PROMOTION_NEW, TYPE_NOTIFICATION.ORDER_CANCELLED, TYPE_NOTIFICATION.ORDER_CONFIRMED, TYPE_NOTIFICATION.ORDER_PENDING, TYPE_NOTIFICATION.ORDER_SHIPPED, TYPE_NOTIFICATION.ORDER_SUCCESS, TYPE_NOTIFICATION.ORDER_FAIL],
        required: true,
    },
    noti_receivedId: {
        type: String,
        required: true,
    },
    noti_senderId: {
        type: String,
        required: true,
    },
    noti_content: {
        type: String,
        required: true,
    },
    noti_options: {
        type: Object,
    },
    noti_isRead: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    collection: COLLECTION_NAME
}, );

//Export the model
export default mongoose.model(DOCUMENT_NAME, notificationSchema);