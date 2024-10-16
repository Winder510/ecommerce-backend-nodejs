import {
    CREATED,
    SuccessResponse
} from "../core/success.response.js";
import ProdutService from '../services/product.service.js'
import {
    SkuService
} from "../services/sku.service.js";
import {
    SpuService
} from "../services/spu.service.js";
class ProductController {


    // spu,sku
    createSpu = async (req, res, next) => {
        new SuccessResponse({
            message: "Create new product success",
            metadata: await SpuService.newSPu(req.body)
        }).send(res)
    }

    findOneSku = async (req, res, next) => {
        new SuccessResponse({
            message: "get new product success",
            metadata: await SkuService.getOneSku(req.query)
        }).send(res)
    }

    allSkuBySpu = async (req, res, next) => {
        new SuccessResponse({
            message: "get all product success",
            metadata: await SkuService.allSkuBySpu(req.query)
        }).send(res)
    }

    findOneSpu = async (req, res, next) => {
        const {
            spu_id
        } = req.query
        new SuccessResponse({
            message: "get spu success",
            metadata: await SpuService.getOneSpu({
                _id: spu_id
            })
        }).send(res)
    }

    setDefaultSku = async (req, res, next) => {
        new SuccessResponse({
            message: "set default success",
            metadata: await SkuService.setDefaultSku({
                ...req.body
            })
        }).send(res)
    }

    // for normal user
    getListPublishSpuByCategory = async (req, res, next) => {
        new SuccessResponse({
            message: "get list success",
            metadata: await SpuService.getListPublishSpuByCategory({
                ...req.body
            })
        }).send(res)
    }

    publishProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "publish spu",
            metadata: await SpuService.publishSpu({
                product_id: req.params.id
            })
        }).send(res)
    }

    unPublishProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "unPublish spu",
            metadata: await SpuService.unPublishSpu({
                product_id: req.params.id
            })
        }).send(res)
    }

    getListSearchSpu = async (req, res, next) => {
        new SuccessResponse({
            message: "Get list search spu",
            metadata: await SpuService.searchSpu({
                keySearch: req.params.keySearch
            })
        }).send(res)
    }

    getBestSoldSpuByCategory = async (req, res, next) => {
        new SuccessResponse({
            message: "Get list search spu",
            metadata: await SpuService.getBestSoldSpu({
                ...req.body
            })
        }).send(res)
    }













    //end spu,sku








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