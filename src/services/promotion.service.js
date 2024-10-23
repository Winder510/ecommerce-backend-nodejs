import { productModel } from '../models/product.model.js';

class PromotionService {
    static async createNew({
        name,
        type,
        urlImage,
        urlPage,
        discountPrice,
        appliedProduct,
        startDate,
        endDate,
        bundle_product,
        quantity_limit,
        status,
    }) {
        const newPromotion = new productModel({
            pro_name: name,
            pro_type: type,
            pro_urlImage: urlImage,
            pro_urlPage: urlPage,
            pro_discountPrice: discountPrice,
            pro_appliedProduct: appliedProduct,
            pro_startDate: startDate,
            pro_endDate: endDate,
            pro_bundleProduct: bundle_product,
            pro_quantityLimit: quantity_limit,
            pro_status: endDate < new Date() ? 'inactive' : status,
        });

        const savedPromotion = await newPromotion.save();
        return savedPromotion;
    }
}
export default PromotionService;
