import express from 'express'
import morgan from 'morgan'
import helmet from "helmet";
import compression from 'compression'
import router from './routes/index.js'
import cookieParser from 'cookie-parser'
const app = express()
//init db
import './dbs/init.mongo.js'
import {
    initRedis
} from './dbs/init.redis.js'
await initRedis();

// init middleware
app.use(morgan("dev"))
app.use(helmet())
app.use(compression())
app.use(cookieParser())
// For parsing application/json
app.use(express.json());
// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({
    extended: true
}));

// init route
app.use('/', router)

// handling error
app.use((req, res, next) => {
    const error = new Error("Not found !!")
    error.status = 404;
    next(error)
})

// The default error handler
app.use((error, req, res, next) => {
    const statusCode = error.status || 500;
    return res.status(statusCode).json({
        status: 'Error!!',
        code: statusCode,
        stack: error.stack,
        message: error.message || "Internal server error"

    })
})
export default app;