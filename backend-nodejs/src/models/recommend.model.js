// !dmbg
import mongoose, {
    Schema
} from 'mongoose'; // Erase if already required

const COLLECTION_NAME = 'Recommneds';
const DOCUMENT_NAME = 'Recommend';
var recommendSchema = new mongoose.Schema({
    rec_userId: {
        type: Schema.Types.ObjectId, // Remove () after ObjectId
        ref: 'User', // Add reference to User model for population
        required: true,
    },
    rec_viewedProduct: {
        type: Schema.Types.ObjectId, // Reference to Product model instead of String
        ref: 'Product', // Add reference to Product model
        required: true,
    },
    rec_purchasedProduct: {
        type: Schema.Types.ObjectId, // Reference to Product model instead of String
        ref: 'Product', // Add reference to Product model
        required: true,
    },
    rec_interactionType: {
        type: String,
        enum: ['view', 'purchase', 'wishlist', 'cart'], // Optional: more detailed tracking
        default: 'view'
    },
    rec_confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.5 // Confidence score of recommendation
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME,
}, );

//Export the model
export default mongoose.model(DOCUMENT_NAME, recommendSchema);