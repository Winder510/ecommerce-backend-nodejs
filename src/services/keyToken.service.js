import keyTokenModel from "../models/keyToken.model.js";

class KeyTokenService {
    static createKeyToken = async ({
        userId,
        publicKey,
        refreshToken
    }) => {
        try {
            // const publicKeyString = publicKey.toString();
            // console.log(publicKeyString)
            // const token = await (keyTokenModel.create({
            //     user: userId,
            //     publicKey: publicKeyString
            // }))
            // return token ? publicKeyString : null
            const filter = {
                    user: userId
                },
                update = {
                    publicKey,
                    refreshToken,
                },
                options = {
                    upsert: true,
                    new: true
                }
            const tokens = await keyTokenModel.findOneAndUpdate(filter, update, options)
            return tokens ? tokens.publicKey : null
        } catch (e) {
            console.log(e)
        }
    }
    static findByUserId = async (userId) => {
        return await keyTokenModel.findOne({
            user: userId
        }).lean()
    }
    static removeKeyById = async (id) => {
        return await keyTokenModel.deleteOne({
            _id: id
        })
    }
}
export default KeyTokenService;