// !dmbg
import mongoose from 'mongoose'; // Erase if already required
import {
    TYPE_NOTIFICATION
} from '../constant/index.js';
const COLLECTION_NAME = "Notifications"
const DOCUMENT_NAME = "Notification"
// Declare the Schema of the Mongo model
var notificationSchema = new mongoose.Schema({
    noti_type: {
        type: String,
        enum: [TYPE_NOTIFICATION.ORDER_001, TYPE_NOTIFICATION.ORDER_002],
        required: true
    },
    noti_receivedId: {
        type: String,
        required: true
    },
    noti_content: {
        type: String,
        required: true
    },
    noti_options: {
        type: Object,
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
export default mongoose.model(DOCUMENT_NAME, notificationSchema);