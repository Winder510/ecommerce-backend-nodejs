import mongoose, {
    Schema
} from 'mongoose'; // Erase if already required

const COLLECTION_NAME = 'Skus';
const DOCUMENT_NAME = 'Sku';

const skuSchema = new Schema({
    sku_name: {
        type: String,
    },
    sku_index: {
        type: Array,
        default: [0],
    },
    sku_default: {
        type: Boolean,
        default: false,
    },
    sku_imgs: {
        type: Array,
        default: [],
    },
    sku_slug: {
        type: String,
        default: '',
    },
    sku_price: {
        type: Number,
        required: true,
    },
    sku_stock: {
        type: Number,
        default: 0,
    },
    loyalPointRate: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.05
    },
    sku_quantitySold: {
        type: Number,
        default: 0,
    },
    product_id: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    isDraft: {
        type: Boolean,
        default: true,
        index: true,
        select: false,
    },
    isPublished: {
        type: Boolean,
        default: false,
        index: true,
        select: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, {
    collection: COLLECTION_NAME,
    timestamps: true,
}, );
export default mongoose.model(DOCUMENT_NAME, skuSchema);