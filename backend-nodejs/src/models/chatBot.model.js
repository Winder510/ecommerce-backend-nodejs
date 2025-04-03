// !dmbg
import mongoose, {
    Schema
} from 'mongoose';

const DOCUMENT_NAME = 'ChatBot';
const COLLECTION_NAME = 'ChatBots';

var chatBotSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        index: true,
    },
    chatHistory: [{
        role: {
            type: String,
            enum: ['user', 'model'],
            required: true
        },
        content: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now,
            index: true
        }
    }]
}, {
    timestamps: true,
    collection: COLLECTION_NAME,
}, );

//Export the model
export default mongoose.model(DOCUMENT_NAME, chatBotSchema);