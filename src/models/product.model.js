import mongoose, {
    Schema
} from 'mongoose'; // Erase if already required

const COLLECTION_NAME = "Products"
const DOCUMENT_NAME = "Product"

const productSchema = new Schema({
    product_name: {
        type: String,
        required: true
    },
    product_thumb: {
        type: String,
        required: true
    },
    product_description: {
        type: String,
    },
    product_price: {
        type: Number,
        required: true
    },
    product_quantity: {
        type: Number,
        required: true
    },
    product_type: {
        type: String,
        required: true,
        default: "Electronics" // Clothing,furniture
    },
    product_attributes: {
        type: Schema.Types.Mixed,
        required: true
    }
}, {
    collection: COLLECTION_NAME,
    timestamps: true
})

const iphoneSchema = new Schema({
    color: {
        type: String,
        required: true,
    },
    screen: {
        type: Object
    },
    front_camera: {
        type: Object
    },
    rear_camera: {
        type: Object
    },
    // ..., 
}, {
    collection: 'iPhones',
    timestamps: true
})
const macSchema = new Schema({
    processor: {
        type: Object
    },
    ram_hard_drive: {
        type: Object
    },
    screenn: {
        type: Object
    },
    // ...
}, {
    collection: 'Macs',
    timestamps: true
})
// Create models for each schema
const productModel = mongoose.model(DOCUMENT_NAME, productSchema);
const iPhoneModel = mongoose.model('iPhone', iphoneSchema);
const macModel = mongoose.model('Mac', macSchema);

// Export the models
export {
    productModel,
    iPhoneModel,
    macModel
};