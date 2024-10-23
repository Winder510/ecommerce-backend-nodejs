// !dmbg
import mongoose, { Schema } from 'mongoose'; // Erase if already required

const DOCUMENT_NAME = 'Attribute';
const COLLECTION_NAME = 'Attributes';

const attributeSchema = new Schema(
    {
        propertyName: {
            type: String,
            required: true,
            trim: true,
        },
        displayName: {
            type: String,
            required: true,
            trim: true,
        },
        value: {
            type: Schema.Types.Mixed,
            required: true,
        },
    },
    {
        _id: false,
    },
);
var attributeGroupSchema = new mongoose.Schema(
    {
        groupName: {
            type: String,
            required: true,
            trim: true,
        },
        groupIcon: {
            type: String,
            trim: true,
        },
        attributes: {
            type: [attributeSchema],
            default: [],
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    },
);

export default mongoose.model(DOCUMENT_NAME, attributeGroupSchema);
