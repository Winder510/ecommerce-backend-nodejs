import {
    BadRequestError
} from "../core/error.response.js";
import {
    SuccessResponse
} from "../core/success.response.js";
import {
    AddToCartDto
} from "../dtos/request/cart/AddToCartDto.js";
import {
    CartService
} from "../services/cart.service.js";


class CartController {
    addToCart = async (req, res, next) => {
        const {
            error
        } = AddToCartDto.validate(req.body);

        if (error) throw new BadRequestError("HI")

        new SuccessResponse({
            message: "success",
            metadata: await CartService.addToCart(req.body)
        }).send(res)
    }

    update = async (req, res, next) => {
        new SuccessResponse({
            message: "success",
            metadata: await CartService.addToCartV2(req.body)
        }).send(res)
    }

    delete = async (req, res, next) => {
        new SuccessResponse({
            message: "success",
            metadata: await CartService.deleteUserCart(req.body)
        }).send(res)
    }

    listToCart = async (req, res, next) => {
        new SuccessResponse({
            message: "success",
            metadata: await CartService.getListUserCart(req.query)
        }).send(res)
    }

}
export default new CartController();