import keyTokenModel from "../models/keyToken.model.js";

class KeyTokenService {
    static createKeyToken = async ({
        userId,
        publicKey
    }) => {
        try {
            const publicKeyString = publicKey.toString();
            console.log(publicKeyString)
            const token = await (keyTokenModel.create({
                user: userId,
                publicKey: publicKeyString
            }))
            return token ? publicKeyString : null
        } catch (e) {
            console.log(e)
        }
    }
}
export default KeyTokenService;