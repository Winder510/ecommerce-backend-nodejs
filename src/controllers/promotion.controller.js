class PromotionController {
    createNew = async (req, res, next) => {
        new SuccessResponse({
            message: "Update product",
            metadata: await ProdutService.updateProduct(req.body.product_type, req.params.product_id, req.body)
        }).send(res)

    }

}
export default new PromotionController