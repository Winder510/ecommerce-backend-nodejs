import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import router from './routes/index.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
// import './services/cronJob.service.js'
const app = express();

//init db
import './dbs/init.mongo.js';
import {
    initIORedis
} from './dbs/init.redis.js';
import {
    initElastic
} from './dbs/init.elastic.js';
import session from 'express-session';
import passport from './configs/passport.config.js';

// Initialize databases
await initIORedis();
await initElastic();

app.use('/api/v1/payment/webhook', express.raw({
    type: 'application/json'
}));
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(
    cors({
        credentials: true, // Cho phép gửi cookie và thông tin xác thực
        origin: 'http://localhost:5173', // Chỉ định domain frontend của bạn
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Các phương thức HTTP được phép
        preflightContinue: false, // Không chuyển tiếp yêu cầu OPTIONS
        optionsSuccessStatus: 204, // Trả về status code 204 cho yêu cầu OPTIONS
    }),
);

// For parsing application/json
app.use(express.json());
// For parsing application/x-www-form-urlencoded
app.use(
    express.urlencoded({
        extended: true,
    }),
);

// Middleware session
app.use(
    session({
        secret: 'your-secret-key',
        resave: false,
        saveUninitialized: true,
    }),
);

// Middleware passport
app.use(passport.initialize());
app.use(passport.session());

// init route
app.use('/', router);

// handling error
app.use((req, res, next) => {
    const error = new Error('Not found !!');
    error.status = 404;
    next(error);
});

// The default error handler
app.use((error, req, res, next) => {
    const statusCode = error.status || 500;
    console.log("🚀 ~ returnres.status ~ error.stack:", error.stack)
    return res.status(statusCode).json({
        status: 'Error!!',
        code: statusCode,
        stack: error.stack,
        message: error.message || 'Internal server error',
    });
});

export default app;