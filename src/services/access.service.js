import shopModel from "../models/shop.model.js";
import bcrypt from "bcrypt";

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

            const newShop = shopModel.create({
                name,
                email,
                passwordHash,
                roles: [RoleShop.ADMIN]
            })
            if (newShop) {
                // refresh token
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