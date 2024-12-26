// recommendation.controller.js

import advantageRecommendService from "../services/advantageRecommend.service.js";
import recommendService from "../services/recommend.service.js";

class RecommendationController {
    async getRecommendations(req, res) {
        try {
            const {
                productId
            } = req.params;
            const limit = parseInt(req.query.limit) || 5;

            // Lấy các loại recommendation khác nhau
            const [similarProducts, popularProducts, priceRangeProducts] = await Promise.all([
                recommendService.findSimilarProducts({
                    productId,
                    limit
                }),
                recommendService.findPopularProducts({
                    limit
                }),
                recommendService.findProductsByPriceRange({
                    productId,
                    limit
                })
            ]);

            return res.status(200).json({
                status: 'success',
                data: {
                    similarProducts,
                    popularProducts,
                    priceRangeProducts
                }
            });
        } catch (error) {
            return res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async getRecommendationsV2(req, res) {
        try {
            const {
                userId,
                productId
            } = req.params;
            const limit = parseInt(req.query.limit) || 5;

            const [
                hybridRecs,
                segmentRecs,
                trendingRecs
            ] = await Promise.all([
                advantageRecommendService.getHybridRecommendations({
                    userId,
                    productId,
                    limit
                }),
                advantageRecommendService.getSegmentBasedRecommendations(
                    userId,
                    limit
                ),
                advantageRecommendService.getTrendingRecommendations(limit)
            ]);

            return res.status(200).json({
                status: 'success',
                data: {
                    recommended: hybridRecs,
                    forYou: segmentRecs,
                    trending: trendingRecs
                }
            });
        } catch (error) {
            console.error('Recommendation error:', error);
            return res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    }
}

export default new RecommendationController();