// !dmbg
import mongoose, {
    Schema
} from 'mongoose'; // Erase if already required
import {
    type
} from 'os';

const COLLECTION_NAME = "Roles"
const DOCUMENT_NAME = "Role"
// Declare the Schema of the Mongo model
var roleSchema = new mongoose.Schema({
    rol_name: {
        type: String,
        default: 'user',
        enum: ['admin', 'user']

    },
    rol_slug: {
        type: String,
        required: true
    },
    rol_description: {
        type: String,
        required: true
    },
    rol_status: {
        type: String,
        default: 'active',
        enum: ['pending', 'active', 'block']
    },
    rol_grants: [{
        resource: {
            type: Schema.Types.ObjectId,
            ref: 'Resource',
            required: true
        },
        actions: [{
            type: String,
            required: true
        }],
        attributes: {
            type: String,
            default: '*'
        }
    }]
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
export default mongoose.model(DOCUMENT_NAME, roleSchema);