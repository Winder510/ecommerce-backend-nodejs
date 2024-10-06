// !dmbg
import mongoose, {
    Schema
} from 'mongoose'; // Erase if already required

const DOCUMENT_NAME = "Comment"
const COLLECTION_NAME = "comments"

// Declare the Schema of the Mongo model
var commentSchema = new mongoose.Schema({

}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
export default mongoose.model(DOCUMENT_NAME, commentSchema);