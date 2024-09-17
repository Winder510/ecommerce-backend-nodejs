// !dmbg
import mongoose, {
    Schema
} from 'mongoose'; // Erase if already required

const DOCUMENT_NAME = "Iventory"
const COLLECTION_NAME = "Iventories"

// Declare the Schema of the Mongo model
var iventoryShema = new mongoose.Schema({
    inven_productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }

}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
export default mongoose.model(DOCUMENT_NAME, iventoryShema);