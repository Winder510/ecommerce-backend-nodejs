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
    src_slug: {
        type: String,
        required: true,
    },
    src_description: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
    collection: COLLECTION_NAME,
}, );

//Export the model
export default mongoose.model(DOCUMENT_NAME, recommendSchema);