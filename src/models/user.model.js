// !dmbg
import mongoose, {
    Schema
} from 'mongoose'; // Erase if already required

const COLLECTION_NAME = "Users"
const DOCUMENT_NAME = "User"
// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    usr_id: {
        type: Number,
        required: true
    },
    usr_slug: {
        type: String,
        required: true
    },
    usr_name: {
        type: String,
        required: true,
    },
    usr_password: {
        type: String,
        required: true
    },
    usr_salf: {
        type: String,
        required: true
    },
    usr_email: {
        type: String,
        required: true
    },
    usr_phone: {
        type: String,
        required: true
    },
    usr_sex: {
        type: Number,
    },
    usr_avatar: {
        type: String,
        default: ''
    },
    usr_date_of_birth: {
        type: Date,
        default: null
    },
    usr_roles: {
        type: Schema.Types.ObjectId,
        ref: 'Role'
    },
    usr_status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'active', 'block']
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
export default mongoose.model(DOCUMENT_NAME, userSchema);