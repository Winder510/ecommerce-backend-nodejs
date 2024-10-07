// !dmbg
import mongoose, {
    Schema
} from 'mongoose'; // Erase if already required
import slugify from 'slugify';

const COLLECTION_NAME = "Users"
const DOCUMENT_NAME = "User"
// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    usr_slug: {
        type: String,
    },
    usr_name: {
        type: String,
        required: true,
    },
    usr_password: {
        type: String,
        required: true
    },
    usr_email: {
        type: String,
        required: true
    },
    usr_phone: {
        type: String,
    },
    usr_sex: {
        type: String,
    },
    usr_avatar: {
        type: String,
        default: ''
    },
    usr_date_of_birth: {
        type: Date,
        default: null
    },
    usr_role: {
        type: Schema.Types.ObjectId,
        ref: 'Role'
    },
    usr_isDefaultPassword: {
        type: Boolean,
        default: true
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
// middle ware 
userSchema.pre('save', function (next) {
    this.usr_slug = slugify(this.usr_name, {
        lower: true
    })
    next()
})

//Export the model
export default mongoose.model(DOCUMENT_NAME, userSchema);