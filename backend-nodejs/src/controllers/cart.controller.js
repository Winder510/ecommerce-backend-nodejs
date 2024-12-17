import {
    SuccessResponse
} from '../core/success.response.js';

import {
    CartService
} from '../services/cart.service.js';

class CartController {
    addToCart = async (req, res, next) => {
        new SuccessResponse({
            message: 'success',
            metadata: await CartService.addToCart(req.body),
        }).send(res);
    };

    update = async (req, res, next) => {
        new SuccessResponse({
            message: 'success',
            metadata: await CartService.addToCartV2(req.body),
        }).send(res);
    };

    delete = async (req, res, next) => {
        new SuccessResponse({
            message: 'success',
            metadata: await CartService.deleteUserCart(req.body),
        }).send(res);
    };

    showCart = async (req, res, next) => {
        new SuccessResponse({
            message: 'success',
            metadata: await CartService.showCart(req.query),
        }).send(res);
    };

    replaceItem = async (req, res, next) => {
        new SuccessResponse({
            message: 'success',
            metadata: await CartService.replaceItemInCart(req.body),
        }).send(res);
    };

    getCartBUserId = async (req, res, next) => {
        new SuccessResponse({
            message: 'success',
            metadata: await CartService.getCartByUserId(req.body),
        }).send(res);
    };

    getCartForLocal = async (req, res, next) => {
        new SuccessResponse({
            message: 'success',
            metadata: await CartService.getProductInforForLocal(req.body),
        }).send(res);
    };

    addToCartFromLocal = async (req, res, next) => {
        new SuccessResponse({
            message: 'success',
            metadata: await CartService.addToCartFromLocal(req.body),
        }).send(res);
    };

}
export default new CartController();