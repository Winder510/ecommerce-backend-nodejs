// !dmbg
import mongoose from 'mongoose'; // Erase if already required

const COLLECTION_NAME = "Keys"
const DOCUMENT_NAME = "Key"

// Declare the Schema of the Mongo model
var keyTokenShema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Shop'
    },
    publicKey: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String,
        required: true
    }

}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
export default mongoose.model(DOCUMENT_NAME, keyTokenShema);