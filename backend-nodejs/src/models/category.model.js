// !dmbg
import mongoose, {
    Schema
} from 'mongoose'; // Erase if already required
import slugify from 'slugify';
import {
    randomNummber
} from '../utils/index.js';

const DOCUMENT_NAME = 'Category';
const COLLECTION_NAME = 'Categories';

// Declare the Schema of the Mongo model
var categorySchema = new mongoose.Schema({
    category_name: {
        type: String,
        required: true,
    },
    category_description: {
        type: String,
    },
    category_slug: {
        type: String,
    },
    category_parentId: {
        type: Schema.Types.ObjectId,
        index: true,
    },
    category_img: {
        type: String,
        require: true
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME,
}, );

categorySchema.pre('save', function (next) {
    this.category_slug = slugify(this.category_name + '-' + randomNummber());
    next();
});
//Export the model
export default mongoose.model(DOCUMENT_NAME, categorySchema);