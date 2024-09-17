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
    getAllDraftProductForShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Get list product",
            metadata: await ProdutService.findAllDraftProductForShop()
        }).send(res)
    }

    publishProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "publish product",
            metadata: await ProdutService.publishProduct({
                product_id: req.params.id
            })
        }).send(res)
    }

    unPublishProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "unPublish product",
            metadata: await ProdutService.unPublishProduct({
                product_id: req.params.id
            })
        }).send(res)
    }

    getAllPublishedProductForShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Get list product",
            metadata: await ProdutService.findAllPublishProductForShop()
        }).send(res)
    }


    findAllProducts = async (req, res, next) => {
        new SuccessResponse({
            message: "Find all products success",
            metadata: await ProdutService.findAllProducts(req.query)
        }).send(res)
    }

    findProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "Find product success",
            metadata: await ProdutService.findProduct({
                product_id: req.params.product_id
            })
        }).send(res)
    }


    getListSearchProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "Get list  search product",
            metadata: await ProdutService.searchProduct({
                keySearch: req.params.keySearch
            })
        }).send(res)
    }

    // update product
    updateProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "Update product",
            metadata: await ProdutService.updateProduct(req.body.product_type, req.params.product_id, req.body)
        }).send(res)

    }


}
export default new ProductController();