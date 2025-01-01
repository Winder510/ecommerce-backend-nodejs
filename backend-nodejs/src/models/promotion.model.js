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
    prom_banner: {
        type: String,
        required: true,
    },
    appliedProduct: [{
        spuId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'spu',
            required: true
        },
        sku_list: [{
            skuId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'sku',
                required: true
            },
            discountType: {
                type: String,
                enum: ['PERCENTAGE', 'FIXED'],
                required: true
            },
            discountValue: {
                type: Number,
                required: true
            },
            quantityLimit: {
                type: Number,
                min: 1
            },
            maxDiscountValue: {
                type: Number,
                required: true
            },
            appliedQuantity: {
                type: Number,
                default: 0
            }
        }]
    }],
    eventType: {
        type: String,
        enum: ['Flash sale', 'Custom'],
    },
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
    disable: {
        type: Boolean,
        default: false
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