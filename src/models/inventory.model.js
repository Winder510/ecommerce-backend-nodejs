// !dmbg
import mongoose, {
    Schema
} from 'mongoose'; // Erase if already required

const DOCUMENT_NAME = "Iventory"
const COLLECTION_NAME = "Iventories"

// Declare the Schema of the Mongo model
var inventoryShema = new mongoose.Schema({
    inven_productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },
    inven_locaion: {
        type: String,
        default: 'QB'
    },
    inven_stock: {
        type: Number,
        required: true
    },
    inven_reservation: {
        type: Array,
        default: []
        /*
            cartd:
            stock:1
            createdOn
        */
    }

}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
export default mongoose.model(DOCUMENT_NAME, inventoryShema);