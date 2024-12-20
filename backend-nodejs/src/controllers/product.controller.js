import {
    SuccessResponse
} from '../core/success.response.js';
import {
    SkuService
} from '../services/sku.service.js';
import {
    SpuService
} from '../services/spu.service.js';
class ProductController {
    // spu,sku
    createSpu = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create new product ',
            metadata: await SpuService.newSPu(req.body),
        }).send(res);
    };

    updateSpu = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update new product ',
            metadata: await SpuService.updateSpu({
                ...req.body,
                ...req.params
            }),
        }).send(res);
    };

    deleteSpu = async (req, res, next) => {
        new SuccessResponse({
            message: 'delete new product ',
            metadata: await SpuService.deleteSpu({
                spuId: req.params.id
            }),
        }).send(res);
    };


    findOneSku = async (req, res, next) => {
        new SuccessResponse({
            message: 'get new product success',
            metadata: await SkuService.getOneSku(req.query),
        }).send(res);
    };

    allSkuBySpu = async (req, res, next) => {
        new SuccessResponse({
            message: 'get all product success',
            metadata: await SkuService.allSkuBySpu(req.query),
        }).send(res);
    };

    findOneSpu = async (req, res, next) => {
        const {
            spu_id
        } = req.query;
        new SuccessResponse({
            message: 'get spu success',
            metadata: await SpuService.getOneSpu({
                _id: spu_id,
            }),
        }).send(res);
    };

    setDefaultSku = async (req, res, next) => {
        new SuccessResponse({
            message: 'set default success',
            metadata: await SkuService.setDefaultSku({
                ...req.body,
            }),
        }).send(res);
    };

    // for normal user
    getListPublishSpuByCategory = async (req, res, next) => {
        new SuccessResponse({
            message: 'get list success',
            metadata: await SpuService.getListPublishSpuByCategory({
                ...req.body,
            }),
        }).send(res);
    };

    getListSearchSpu = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list search spu',
            metadata: await SpuService.searchSpu({
                keySearch: req.params.keySearch,
            }),
        }).send(res);
    };

    getBestSoldSpuByCategory = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list search spu',
            metadata: await SpuService.getBestSoldSpu({
                ...req.body,
            }),
        }).send(res);
    };

    //admin
    publishProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'publish spu',
            metadata: await SpuService.publishSpu({
                product_id: req.params.id,
            }),
        }).send(res);
    };

    unPublishProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'unPublish spu',
            metadata: await SpuService.unPublishSpu({
                product_id: req.params.id,
            }),
        }).send(res);
    };

    getBestSoldSpuEachCategory = async (req, res, next) => {
        new SuccessResponse({
            message: 'get success',
            metadata: await SpuService.getBestSoldSpuEachCategory(),
        }).send(res);
    };

    getAllPublishedSpu = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list publish spu',
            metadata: await SpuService.findAllPublishSpu({}),
        }).send(res);
    };

    getAllSpu = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list  spu',
            metadata: await SpuService.findAllSpu({}),
        }).send(res);
    };

    getAllDraftSpu = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list draft spu ',
            metadata: await SpuService.findAlLDraftSpu({}),
        }).send(res);
    };

    findAllSpuWithCondition = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list spu ',
            metadata: await SpuService.findAllSpuWithCondition({
                ...req.query
            }),
        }).send(res);
    };
    getListProdcutDetailsForAdmin = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list spu ',
            metadata: await SpuService.getListProdcutDetailsForAdmin({
                ...req.body,
            }),
        }).send(res);
    };

}
export default new ProductController();