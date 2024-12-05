// !dmbg
import mongoose from 'mongoose'; // Erase if already required

const COLLECTION_NAME = 'otp_logs';
const DOCUMENT_NAME = 'otp_log';
// Declare the Schema of the Mongo model
var otpSchema = new mongoose.Schema({
    otp_token: {
        type: String,
        required: true,
    },
    otp_email: {
        type: String,
        required: true,
    },
    otp_status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'active', 'block'],
    },
    expireAt: {
        type: Date,
        default: Date.now,
        expires: 120,
    },
}, {
    timestamps: true,
    collection: COLLECTION_NAME,
}, );

//Export the model
export default mongoose.model(DOCUMENT_NAME, otpSchema);