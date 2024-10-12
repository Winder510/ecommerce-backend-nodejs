// !dmbg
import mongoose, {
    Schema
} from 'mongoose'; // Erase if already required

const DOCUMENT_NAME = "Cart"
const COLLECTION_NAME = "Carts"

// Declare the Schema of the Mongo model
var cartSchema = new mongoose.Schema({
    cart_state: {
        type: String,
        enum: ['active', 'completed'],
        default: 'active'
    },
    cart_products: {
        type: Array,
        required: true,
        default: []
        /**
         * [
         *   {
         *      productId,quantity,name,price
         *   }
         * ]
         */
    },
    cart_count_product: {
        type: Number,
        default: 0
    },
    cart_userId: {
        type: Schema.Types.ObjectId,
        required: true
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});
cartSchema.pre('save', function (next) {
    this.cart_count_product = this.cart_count_product.length
    next()
})
//Export the model
export default mongoose.model(DOCUMENT_NAME, cartSchema);