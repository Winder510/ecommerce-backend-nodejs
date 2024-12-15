// !dmbg
import mongoose, {
    Schema
} from 'mongoose'; // Erase if already required
import mongooseDelete from 'mongoose-delete';

const DOCUMENT_NAME = 'Comment';
const COLLECTION_NAME = 'Comments';

// Declare the Schema of the Mongo model
var commentSchema = new mongoose.Schema({
    comment_productId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Product',
    },
    comment_userId: {
        type: String,
        ref: "User",
        required: true,
    },
    comment_content: {
        type: String,
        required: true,
    },
    comment_left: {
        type: Number,
        required: true,
    },
    comment_right: {
        type: Number,
        required: true,
    },
    comment_likes: {
        type: Number,
        default: 0,
    },
    comment_rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
    },
    comment_user_likes: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    comment_parentId: {
        type: Schema.Types.ObjectId,
    },
}, {
    timestamps: true,
    collection: COLLECTION_NAME,
}, );

// commentSchema.plugin(mongooseDelete, {
//     deletedAt: true,
//     overrideMethods: ['all'],
// });

//Export the model
export default mongoose.model(DOCUMENT_NAME, commentSchema);