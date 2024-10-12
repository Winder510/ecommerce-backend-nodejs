import mongoose from 'mongoose';
import 'dotenv/config';

const connectString = process.env.MONGO_URI || "mongodb+srv://22521084:Jd2gqXdFSUCJXCZO@ecommerce-backend-nodej.lvutf.mongodb.net/";


class Database {
    constructor() {
        this.connect()
    }
    connect() {
        mongoose.connect(connectString, {
            maxPoolSize: 50
        }).then(_ => console.log("Connect success")).catch(err => console.log("Err connect"))
    }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance
    }
}

const instanceMongodb = Database.getInstance()
export default instanceMongodb