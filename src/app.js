import express from 'express'
import morgan from 'morgan'
import helmet from "helmet";
import compression from 'compression'
import router from './routes/index.js'

const app = express()
//init db
import './dbs/init.mongo.js'

// init middleware
app.use(morgan("dev"))
app.use(helmet())
app.use(compression())
// For parsing application/json
app.use(express.json());
// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({
    extended: true
}));

// init route
app.use('/', router)

export default app;