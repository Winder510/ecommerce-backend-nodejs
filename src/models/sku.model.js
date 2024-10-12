import mongoose, {
    Schema
} from 'mongoose'; // Erase if already required

const COLLECTION_NAME = "Skus"
const DOCUMENT_NAME = "Sku"

const skuSchema = new Schema({
    sku_id: {
        type: String,
        required: true,
        unique: true
    },
    sku_index: {
        type: Array,
        default: [0]
    },
    sku_default: {
        type: Boolean,
        default: false,
    },
    sku_slug: {
        type: String,
        default: "",
    },
    sku_sort: {
        type: Number,
        default: 0,
    },
    sku_price: {
        type: String,
        required: true,
    },
    sku_stock: {
        type: Number,
        default: 0,
    },
    product_id: {
        type: String,
        required: true, // ref to spu product
    },
    isDraft: {
        type: Boolean,
        default: true,
        index: true,
        select: false
    },
    isPublished: {
        type: Boolean,
        default: false,
        index: true,
        select: false
    },
    isDeleted: {
        type: Boolean,
        default: false,
    }

}, {
    collection: COLLECTION_NAME,
    timestamps: true
})

export default mongoose.model(DOCUMENT_NAME, skuSchema);