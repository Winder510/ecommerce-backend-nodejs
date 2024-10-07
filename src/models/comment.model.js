// !dmbg
import mongoose, {
    Schema
} from 'mongoose'; // Erase if already required


const DOCUMENT_NAME = "Comment"
const COLLECTION_NAME = "Comments"

// Declare the Schema of the Mongo model
var commentSchema = new mongoose.Schema({
    comment_productId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Product"
    },
    comment_userId: {
        type: String,
        required: true
    },
    comment_content: {
        type: String,
        required: true
    },
    comment_left: {
        type: Number,
        required: true
    },
    comment_right: {
        type: Number,
        required: true
    },
    comment_parentId: {
        type: Schema.Types.ObjectId,

    },
    comment_isDeleted: {
        type: Boolean,
        default: false
    },


}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
export default mongoose.model(DOCUMENT_NAME, commentSchema);