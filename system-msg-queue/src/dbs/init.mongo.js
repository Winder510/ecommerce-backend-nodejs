import mongoose from 'mongoose'

const connectString = 'mongodb+srv://22521084:Jd2gqXdFSUCJXCZO@ecommerce-backend-nodej.lvutf.mongodb.net/';
//'mongodb://appleshop:123456789@localhost:27017/appleshop?authSource=admin';
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