// recommendation.controller.js

import {
    SuccessResponse
} from "../core/success.response.js";
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

    async getRecommendForDetailProductPage(req, res) {
        const {
            productId
        } = req.params;
        const userId = req.user.userId;

        const recommendations = await advantageRecommendService.getHybridRecommendations({
            userId,
            productId,
            limit: 5
        })

        new SuccessResponse({
            message: 'Get recommend in detail page',
            metadata: recommendations
        }).send(res);
    }

    async getRecommendForHomePage(req, res) {
        const userId = req.user.userId;

        const [
            personalizedRecs,
            trendingProducts
        ] = await Promise.all([
            advantageRecommendService.getSegmentBasedRecommendations(userId, 10),
            advantageRecommendService.getTrendingRecommendations(10)
        ]);

        new SuccessResponse({
            message: 'Get recommend in detail page',
            metadata: {
                forYou: personalizedRecs,
                trending: trendingProducts
            }
        }).send(res);
    }

    async getRecommendForCartPage(req, res) {
        const userId = req.user.userId;
        const cartItems = await cartModel.findOne({
            cart_userId: userId
        });

        const recommendations = await Promise.all(
            cartItems.products.map(item =>
                advantageRecommendService.getContentBasedRecommendations(
                    item.productId,
                    5
                )
            )
        );

        new SuccessResponse({
            message: 'Get recommend in detail page',
            metadata: recommendations.flat()
        }).send(res);
    }

    async getRecommendForProfilePage(req, res) {
        const userId = req.user.userId;

        const personalizedRecs = await advantageRecommendService
            .getCollaborativeRecommendations(userId, 10);

        new SuccessResponse({
            message: 'Get recommend in detail page',
            metadata: personalizedRecs
        }).send(res);
    }


}

export default new RecommendationController();