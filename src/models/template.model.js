// !dmbg
import mongoose from 'mongoose'; // Erase if already required

const COLLECTION_NAME = "templates"
const DOCUMENT_NAME = "template"
// Declare the Schema of the Mongo model
var templateSchema = new mongoose.Schema({
    temp_name: {
        type: String,
        required: true
    },
    temp_status: {
        type: String,
        default: 'active',
        enum: ['pending', 'active', 'block']
    },
    temp_html: {
        type: String,
        required: true
    }

}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
export default mongoose.model(DOCUMENT_NAME, templateSchema);