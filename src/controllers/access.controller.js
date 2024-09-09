import AccessService from "../services/access.service.js";

class AccessController {
    signup = async (req, res, next) => {
        try {
            return res.status(201).json(await AccessService.signUp(req.body));
        } catch (e) {
            return res.status(500).json({
                code: 1,
                message: 'Internal Server Error'
            });
        }
    }
}
export default new AccessController();