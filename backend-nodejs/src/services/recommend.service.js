// recommendation.service.js
import spuModel from '../models/spu.model.js';

class RecommendationService {
    // Lấy sản phẩm tương tự dựa trên category
    async findSimilarProducts({
        productId,
        limit = 5
    }) {
        try {
            const product = await spuModel.findById(productId);
            if (!product) throw new Error('Product not found');

            // Tìm sản phẩm cùng category, sắp xếp theo rating và số lượng bán
            const similarProducts = await spuModel.find({
                    _id: {
                        $ne: productId
                    },
                    product_category: {
                        $in: product.product_category
                    },
                    isPublished: true,
                    isDeleted: false
                })
                .sort({
                    product_ratingAverage: -1,
                    product_quantitySold: -1
                })
                .limit(limit);

            return similarProducts;
        } catch (error) {
            throw new Error(`Error finding similar products: ${error.message}`);
        }
    }

    // Lấy sản phẩm phổ biến nhất
    async findPopularProducts({
        limit = 10
    }) {
        try {
            return await spuModel.find({
                    isPublished: true,
                    isDeleted: false
                })
                .sort({
                    product_quantitySold: -1,
                    product_ratingAverage: -1
                })
                .limit(limit);
        } catch (error) {
            throw new Error(`Error finding popular products: ${error.message}`);
        }
    }

    // Lấy sản phẩm dựa trên tags
    async findProductsByTags({
        tags,
        limit = 5
    }) {
        try {
            return await spuModel.find({
                    product_tags: {
                        $in: tags
                    },
                    isPublished: true,
                    isDeleted: false
                })
                .sort({
                    product_ratingAverage: -1,
                    product_quantitySold: -1
                })
                .limit(limit);
        } catch (error) {
            throw new Error(`Error finding products by tags: ${error.message}`);
        }
    }

    // Lấy sản phẩm trong cùng khoảng giá
    async findProductsByPriceRange({
        productId,
        priceRange = 0.2,
        limit = 5
    }) {
        try {
            const product = await spuModel.findById(productId);
            if (!product) throw new Error('Product not found');

            const minPrice = product.product_price * (1 - priceRange);
            const maxPrice = product.product_price * (1 + priceRange);

            return await spuModel.find({
                    _id: {
                        $ne: productId
                    },
                    product_price: {
                        $gte: minPrice,
                        $lte: maxPrice
                    },
                    isPublished: true,
                    isDeleted: false
                })
                .sort({
                    product_ratingAverage: -1,
                    product_quantitySold: -1
                })
                .limit(limit);
        } catch (error) {
            throw new Error(`Error finding products by price range: ${error.message}`);
        }
    }
}

export default new RecommendationService();