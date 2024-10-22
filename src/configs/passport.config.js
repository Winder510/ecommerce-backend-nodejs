import passport from 'passport';
import {
    Strategy as FacebookStrategy
} from 'passport-facebook';
import crypto from 'crypto'
import dotenv from 'dotenv';
import {
    createUserRepo
} from '../models/repositories/user.repository.js';
import {
    createTokenPair
} from '../auth/authUtils.js';
import KeyTokenService from '../services/keyToken.service.js';

dotenv.config();

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

// Cấu hình Facebook Strategy
passport.use(new FacebookStrategy({
        clientID: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        callbackURL: "/auth/facebook/callback",
        profileFields: ['id', 'displayName', 'email'] // Các trường thông tin cần lấy
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const {
                id,
                name,
                email
            } = profile._json;

            const newUser = await createUserRepo({
                usr_name: name,
                usr_email: email,
                usr_password: id,
                usr_role: '6704099fb8583f3dc7342d12', // user role
            })
            // Tạo JWT sau khi xác thực thành công
            let token = "";

            if (newUser) {
                const {
                    publicKey,
                    privateKey
                } = crypto.generateKeyPairSync('rsa', {
                    modulusLength: 4096,
                    publicKeyEncoding: {
                        type: "pkcs1",
                        format: "pem",
                    },
                    privateKeyEncoding: {
                        type: "pkcs1",
                        format: "pem",
                    },
                });

                const tokens = await createTokenPair({
                    userId: newUser._id,
                    email
                }, publicKey, privateKey);


                await KeyTokenService.upsertKeyToken({
                    userId: newUser._id,
                    publicKey,
                    refreshToken: tokens.refreshToken
                });
                token = tokens

            }
            return done(null, {
                profile,
                token
            });
        } catch (error) {
            return done(error, null);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

export default passport;