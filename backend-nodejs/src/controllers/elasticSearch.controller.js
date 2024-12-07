import {
    SuccessResponse
} from '../core/success.response.js';
import {
    CartService
} from '../services/cart.service.js';
import ElasticService from '../services/elastic.service.js';

class ElasticSeachController {
    searchProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'filter success',
            metadata: await ElasticService.searchProduct(req.query),
        }).send(res);
    };

    suggestSearch = async (req, res, next) => {
        new SuccessResponse({
            message: 'suggest search success',
            metadata: await ElasticService.suggestSearch(req.query),
        }).send(res);
    };



}
export default new ElasticSeachController();