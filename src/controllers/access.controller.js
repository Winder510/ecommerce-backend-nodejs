import AccessService from "../services/access.service.js";

class AccessController {
    signup = async (req, res, next) => {
        try {
            return res.status(201).json(await AccessService.signUp(req.body));
        } catch (e) {

        }
    }
}
export default new AccessController();