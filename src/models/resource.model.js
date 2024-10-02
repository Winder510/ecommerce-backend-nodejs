// !dmbg
import mongoose from 'mongoose'; // Erase if already required

const COLLECTION_NAME = "Resources"
const DOCUMENT_NAME = "Resource"
// Declare the Schema of the Mongo model
var resourceSchema = new mongoose.Schema({
    src_name: {
        type: String,
        required: true
    },
    src_slug: {
        type: String,
        required: true
    },
    src_description: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
export default mongoose.model(DOCUMENT_NAME, resourceSchema);