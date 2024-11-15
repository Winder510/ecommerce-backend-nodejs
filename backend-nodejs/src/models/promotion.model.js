import mongoose, {
    Schema
} from 'mongoose';
const COLLECTION_NAME = 'Promotions';
const DOCUMENT_NAME = 'Promotion';

var promotionSchema = new mongoose.Schema({
    prom_name: {
        type: String,
        required: true,
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'sku',
            required: true
        },
        discountType: {
            type: String,
            enum: ['percentage', 'fixed'],
            required: true
        },
        discountValue: {
            type: Number,
            required: true
        },
        quantityLimit: {
            type: Number,
            required: true, // Giới hạn số lượng giảm giá
            min: 1
        },
        appliedQuantity: {
            type: Number,
            default: 0 // Số lượng giảm giá đã được áp dụng
        }
    }],
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME,
}, );

//Export the model
export default mongoose.model(DOCUMENT_NAME, promotionSchema);