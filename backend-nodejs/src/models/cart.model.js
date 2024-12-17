// !dmbg
import mongoose, {
    Schema
} from 'mongoose'; // Erase if already required

const DOCUMENT_NAME = 'Cart';
const COLLECTION_NAME = 'Carts';

// Declare the Schema of the Mongo model
var cartSchema = new mongoose.Schema({
    cart_state: {
        type: String,
        enum: ['active', 'completed'],
        default: 'active',
    },
    cart_products: [{
        skuId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Sku',
            default: null,
        },
        quantity: {
            type: Number,
            required: true,
            default: 1,
        },
    }, ],
    cart_userId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
}, {
    timestamps: true,
    collection: COLLECTION_NAME,
}, );
//Export the model
export default mongoose.model(DOCUMENT_NAME, cartSchema);