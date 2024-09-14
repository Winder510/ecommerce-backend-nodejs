import {
    CREATED,
    SuccessResponse
} from "../core/success.response.js";
import ProdutService from '../services/product.service.js'
class ProductController {
    createProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "Create new product success",
            metadata: await ProdutService.createProduct(req.body.product_type, req.body)
        }).send(res)
    }
}
export default new ProductController();