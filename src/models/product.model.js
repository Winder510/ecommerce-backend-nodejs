import mongoose, { Schema } from 'mongoose'; // Erase if already required
import slugify from 'slugify';

const COLLECTION_NAME = 'Products';
const DOCUMENT_NAME = 'Product';

const productSchema = new Schema(
    {
        product_name: {
            type: String,
            required: true,
        },
        product_thumb: {
            type: String,
            required: true,
        },
        product_slug: {
            type: String,
        },
        product_description: {
            type: String,
        },
        product_price: {
            type: Number,
            required: true,
        },
        product_discount_price: {
            type: Number,
            required: true,
        },
        product_quantity: {
            type: Number,
            required: true,
        },
        product_type: {
            type: String,
            required: true,
            //default: "iphone" mac ipad ...
        },
        product_totalSold: {
            type: String,
            required: true,
            //default: "iphone" mac ipad ...
        },
        product_attributes: {
            type: Schema.Types.Mixed,
            required: true,
        },
        product_ratingAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must above 1.0'],
            max: [5, 'Rating must below 5.0'],
            set: (val) => Math.round(val * 10) / 10,
        },
        product_variations: {
            type: Array,
            default: [],
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
    },
    {
        collection: COLLECTION_NAME,
        timestamps: true,
    },
);
// create index for search
productSchema.index({
    product_name: 'text',
    product_description: 'text',
});
// middle ware
productSchema.pre('save', function (next) {
    this.product_slug = slugify(this.product_name, {
        lower: true,
    });
    next();
});

const iphoneSchema = new Schema(
    {
        screen: {
            type: Object,
        },
        front_camera: {
            type: Object,
        },
        rear_camera: {
            type: Object,
        },
        // ...,
    },
    {
        collection: 'iPhones',
        timestamps: true,
    },
);
const macSchema = new Schema(
    {
        processor: {
            type: Object,
        },
        ram_hard_drive: {
            type: Object,
        },
        screenn: {
            type: Object,
        },
        // ...
    },
    {
        collection: 'Macs',
        timestamps: true,
    },
);
// Create models for each schema
const productModel = mongoose.model(DOCUMENT_NAME, productSchema);
const iPhoneModel = mongoose.model('iPhone', iphoneSchema);
const macModel = mongoose.model('Mac', macSchema);

// Export the models
export { productModel, iPhoneModel, macModel };
