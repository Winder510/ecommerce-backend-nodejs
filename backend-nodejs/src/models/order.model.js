// !dmbg
import mongoose, {
    Schema
} from 'mongoose'; // Erase if already required

const DOCUMENT_NAME = 'Order';
const COLLECTION_NAME = 'Orders';

// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema({
    order_userId: {
        type: String,
        required: true,
    },
    order_checkout: {
        type: Object,
        default: {},
        /*
        order_checkout={
            totalPrice: 0, // tong tien hang
            feeShip: 0, // phi van chuyen
            totalDiscount: 0, // tong tien discount giam gia
            totalCheckOut: 0 // tong tien phai thanh toán
        }
        */
    },
    order_payment: {
        type: Object,
        default: {},
    },
    order_shipping: { // receive address
        type: Object,
        default: {},
    },
    order_products: { // name thumb nail quantity price: {originalPrice, priceAfterDiscoun, discount}
        type: Array,
        required: true,
    },
    order_trackingNumber: {
        type: String,
        default: 'SPX000',
    },
    order_discount: {
        type: Array,
    },
    order_note: {
        type: String,
    },
    order_status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'cancelled', 'delivered'],
        default: 'pending',
    },
}, {
    timestamps: true,
    collection: COLLECTION_NAME,
}, );

//Export the model
export default mongoose.model(DOCUMENT_NAME, orderSchema);