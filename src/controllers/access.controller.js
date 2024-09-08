class AccessController {
    signup = async (req, res, next) => {
        try {
            console.log(req.body);
            return res.status(201).json({
                code: 0,
                metadata: {
                    userId: 1
                }
            });
        } catch (e) {
            console.error(e); // Log the error
            return res.status(500).json({
                code: 1,
                message: 'Internal Server Error'
            });
        }
    }
}
export default new AccessController();