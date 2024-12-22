// !dmbg
import mongoose, {
    Schema
} from 'mongoose'; // Erase if already required

const DOCUMENT_NAME = 'Discount';
const COLLECTION_NAME = 'discounts';

// Declare the Schema of the Mongo model
var discountSchema = new mongoose.Schema({
    discount_name: {
        type: String,
        required: true,
    },
    discount_description: {
        type: String,
        required: true,
    },
    discount_type: {
        type: String,
        default: 'fixed_amount', // or percentage
    },
    discount_value: {
        type: Number,
        required: true, // 10.000, 10%
    },
    discount_code: {
        type: String,
        required: true,
    },
    discount_start: {
        type: Date,
        required: true,
    },
    discount_end: {
        type: Date,
        required: true,
    },
    discount_max_uses: {
        // tong so luot su dung cua voucher
        type: Number,
        required: true,
    },
    discount_uses_count: {
        type: Number,
        default: 0
    },
    discount_user_used: {
        type: Array,
        default: [], // ai da su dung
    },
    discount_max_uses_per_user: {
        type: Number,
        required: true, // so luong su dung toi da tren 1 user
    },
    discount_max_value: {
        type: Number,
    },
    discount_min_order_value: {
        type: Number,
        required: true,
    },
    discount_is_active: {
        type: Boolean,
        required: true,
    },

    discount_applies_to: {
        type: String,
        required: true,
        enum: ['all', 'specific'],
    },

    discount_product_ids: {
        type: Array,
        default: [], // so san pham duoc ap dung
    },
    discount_isPublic: {
        type: Boolean,
        default: true, // so san pham duoc ap dung
    },
}, {
    timestamps: true,
    collection: COLLECTION_NAME,
}, );

export default mongoose.model(DOCUMENT_NAME, discountSchema);