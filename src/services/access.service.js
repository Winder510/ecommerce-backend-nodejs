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
const RoleShop = {
    ADMIN: "ADMIN",
    USER: "USER"
}

class AccessService {
    static signUp = async ({
        name,
        email,
        password
    }) => {
        try {
            const hodelShop = await shopModel.findOne({
                email
            }).lean();
            if (hodelShop) {
                return {
                    code: 1,
                    message: "Email is all ready exist"
                }
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

                const publicKeyString = await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey
                });

                if (!publicKeyString) {
                    return {
                        code: 1,
                        message: "publicKeyString error",
                    }
                }

                const tokens = await createTokenPair({
                    userId: newShop._id,
                    email
                }, publicKey, privateKey);

                return {
                    code: 201,
                    metadata: {
                        shop: getInfoData({
                            fields: ["_id", "name", "email"],
                            object: newShop
                        }),
                        tokens
                    },
                    message: 'Sign up success'
                }
            }
            return {
                code: 201,
                metadata: null,
                message: 'create failed'
            }
        } catch (e) {
            return {
                code: 1,
                message: e.message,
                status: 'error'
            }
        }
    }
}
export default AccessService;