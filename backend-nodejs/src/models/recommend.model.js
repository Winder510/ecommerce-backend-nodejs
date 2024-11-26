// !dmbg
import mongoose, {
    Schema
} from 'mongoose'; // Erase if already required

const COLLECTION_NAME = 'Recommneds';
const DOCUMENT_NAME = 'Recommend';
var recommendSchema = new mongoose.Schema({
    rec_userId: {
        type: Schema.Types.ObjectId(),
        required: true,
    },
    rec_viewedProduct: {
        type: String,
        required: true,
    },
    rec_purchasedProduct: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
    collection: COLLECTION_NAME,
}, );

//Export the model
export default mongoose.model(DOCUMENT_NAME, recommendSchema);