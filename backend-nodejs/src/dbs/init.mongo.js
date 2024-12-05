import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()
const connectString = process.env.MONGO_CLOUD_URL;
//'mongodb://appleshop:123456789@mongodb:27017/appleshop?authSource=admin';
class Database {
    constructor() {
        this.connect();
        //   mongoose.plugin(globalSoftDeletePlugin);
    }
    connect() {
        mongoose
            .connect(connectString, {
                maxPoolSize: 50,
            })
            .then((_) => console.log('Connect success'))
            .catch((err) => console.log('Err connect'));
    }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
}

const instanceMongodb = Database.getInstance();
export default instanceMongodb;