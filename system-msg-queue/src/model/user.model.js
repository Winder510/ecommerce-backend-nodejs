// !dmbg
import mongoose, {
    Schema
} from 'mongoose'; // Erase if already required

const COLLECTION_NAME = 'Users';
const DOCUMENT_NAME = 'User';
// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    usr_slug: {
        type: String,
    },
    usr_img: {
        type: String,
    },
    usr_name: {
        type: String,
        required: true,
    },
    usr_password: {
        type: String,
        required: true,
    },
    usr_email: {
        type: String,
        required: true,
    },
    usr_phone: {
        type: String,
    },
    usr_address: [{
        fullName: {
            type: String
        },
        phone: {
            type: String
        },
        city: {
            type: String
        },
        district: {
            type: String
        },
        ward: {
            type: String
        },
        specificAddress: {
            type: String
        },
        isDefault: {
            type: Boolean,
            default: false
        },
        fullAddress: {
            type: String
        },
    }],
    usr_sex: {
        type: String,
    },
    usr_avatar: {
        type: String,
        default: '',
    },
    usr_loyalPoint: {
        type: Number,
        default: 0,
    },
    usr_date_of_birth: {
        type: Date,
        default: null,
    },
    googleId: {
        type: String,
    },
    usr_role: {
        type: Schema.Types.ObjectId,
        ref: 'Role',
    },
    usr_isDefaultPassword: {
        type: Boolean,
        default: true,
    },
    usr_status: {
        type: String,
        default: 'active',
        enum: ['active', 'block'],
    },
}, {
    timestamps: true,
    collection: COLLECTION_NAME,
}, );

export default mongoose.model(DOCUMENT_NAME, userSchema);