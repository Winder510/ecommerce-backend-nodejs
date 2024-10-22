import express from 'express'
import morgan from 'morgan'
import helmet from "helmet";
import compression from 'compression'
import router from './routes/index.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
const app = express()
//init db
import './dbs/init.mongo.js'
import {
    initRedis
} from './dbs/init.redis.js'
import session from 'express-session';
import passport from './configs/passport.config.js'
await initRedis();

// init middleware
app.use(morgan("dev"))
app.use(helmet())
app.use(compression())
app.use(cookieParser())
app.use(cors({
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
}))
// For parsing application/json
app.use(express.json());
// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({
    extended: true
}));


// Middleware session
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Middleware passport
app.use(passport.initialize());
app.use(passport.session());

// Đường dẫn để người dùng nhấn nút đăng nhập qua Facebook
app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['email'] // Yêu cầu quyền truy cập email
}));

// Callback sau khi người dùng đăng nhập thành công
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: '/login'
    }),
    (req, res) => {
        const {
            token
        } = req.user;

        res.cookie("refresh_token", token.refreshToken, {
            httpOnly: true,
            maxAge: 60 * 60 * 1000,
        });

        res.json({
            user: req.user.profile._json,
            token: token.accessToken
        });
    }
);

// Route xem thông tin người dùng đã đăng nhập
app.get('/profile', (req, res) => {
    if (req.isAuthenticated()) {
        res.send(req.user); // Hiển thị thông tin người dùng
    } else {
        res.redirect('/login');
    }
});
app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});












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