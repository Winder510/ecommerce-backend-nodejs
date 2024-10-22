import express from 'express'
import passport from '../../configs/passport.config.js'
const router = express.Router()
// Đường dẫn để người dùng nhấn nút đăng nhập qua Facebook
router.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['email'] // Yêu cầu quyền truy cập email
}));

// Callback sau khi người dùng đăng nhập thành công
router.get('/auth/facebook/callback',
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
router.get('/profile', (req, res) => {
    if (req.isAuthenticated()) {
        res.send(req.user); // Hiển thị thông tin người dùng
    } else {
        res.redirect('/login');
    }
});
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

export default router