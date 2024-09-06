import mongoose from 'mongoose';

const connectString = "mongodb+srv://22521084:Jd2gqXdFSUCJXCZO@ecommerce-backend-nodej.lvutf.mongodb.net/";


class Database {
    constructor() {
        this.connect()
    }
    connect() {
        mongoose.connect(connectString).then(_ => console.log("Connect success")).catch(err => console.log("Err connect"))
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