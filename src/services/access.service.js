import shopModel from "../models/shop.model.js";
import bcrypt from "bcrypt";
import crypto from 'crypto'
import KeyTokenService from "./keyToken.service.js";
import {
    createTokenPair
} from "../auth/authUtils.js";
import {
    getInfoData
} from "../utils/index.js";
import {
    AuthFailureError,
    BadRequestError
} from "../core/error.response.js";
import {
    findByEmail
} from "./shop.service.js";
import {
    access
} from "fs";
const RoleShop = {
    ADMIN: "ADMIN",
    USER: "USER"
}

class AccessService {
    static async logout(
        keyStore
    ) {
        return await KeyTokenService.removeKeyById(keyStore._id)
    }
    static async login({
        email,
        password,
        refreshToken = null
    }) {

        const foundShop = await findByEmail({
            email
        })
        if (!foundShop) throw new BadRequestError("Shop is not registered")

        const match = await bcrypt.compare(password, foundShop.password)
        if (!match) throw new AuthFailureError("Authentication error")

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
            userId: foundShop._id,
            email
        }, publicKey, privateKey);

        await KeyTokenService.createKeyToken({
            userId: foundShop._id,
            publicKey,
            refreshToken: tokens.refreshToken
        })
        return {
            shop: getInfoData({
                fields: ["_id", "name", "email"],
                object: foundShop
            }),
            accessToken: tokens.accessToken
        }

    }
    static signUp = async ({
        name,
        email,
        password
    }) => {
        const hodelShop = await shopModel.findOne({
            email
        }).lean();
        if (hodelShop) {
            throw new BadRequestError("Email is exists")
        }
        const passwordHash = await bcrypt.hash(password, 10);

        const newShop = await shopModel.create({
            name,
            email,
            password: passwordHash,
            roles: [RoleShop.ADMIN]
        })
        if (newShop) {
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
                userId: newShop._id,
                email
            }, publicKey, privateKey);

            await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
                refreshToken: tokens.refreshToken
            });
            return {
                shop: getInfoData({
                    fields: ["_id", "name", "email"],
                    object: newShop
                }),
                accessToken: tokens.accessToken
            }
        }
        return {
            metadata: null,
        }
    }
}
export default AccessService;