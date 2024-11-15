import 'dotenv/config';
// Require the cloudinary library
import { v2 as cloudinary } from 'cloudinary';

// Return "https" URLs by setting secure: true
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_KEY_SECRET, // Click 'View API Keys' above to copy your API secret
});

export { cloudinary };
