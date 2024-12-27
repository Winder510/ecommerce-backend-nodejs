// recommendation.controller.js

import {
    SuccessResponse
} from "../core/success.response.js";
import {
    getPriceSpu
} from "../models/repositories/spu.repo.js";
import advantageRecommendService from "../services/advantageRecommend.service.js";
import recommendService from "../services/recommend.service.js";
import cartModel from '../models/cart.model.js';
import {
    getSpuIdBySku
} from "../models/repositories/sku.repo.js";
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

        const spuswithPrice = await Promise.all(recommendations.map(async spu => {
            return {
                ...spu,
                product_price: await getPriceSpu(spu._id)
            }
        }));

        new SuccessResponse({
            message: 'Get recommend in detail page',
            metadata: spuswithPrice
        }).send(res);
    }

    async getRecommendForHomePage(req, res) {
        const userId = req?.user?.userId;
        let personalizedRecs;

        if (userId) {
            personalizedRecs = await advantageRecommendService.getSegmentBasedRecommendations(userId, 10);
        }

        const spuswithPrice = await Promise.all(personalizedRecs.map(async spu => {
            return {
                ...spu,
                product_price: await getPriceSpu(spu._id)
            }
        }));

        new SuccessResponse({
            message: 'Get recommend in home',
            metadata: spuswithPrice
        }).send(res);
    }

    async getRecommendForCartPage(req, res) {
        const userId = req.user.userId;
        const cartItems = await cartModel.findOne({
            cart_userId: userId
        });
        if (!cartItems) return []
        const recommendations = await Promise.all(
            cartItems.cart_products.map(async (item) => {
                const spu = await getSpuIdBySku(item.skuId)
                return advantageRecommendService.getContentBasedRecommendations(
                    spu.product_id,
                    5
                )
            })
        );

        const data = recommendations.flat()
        const spuswithPrice = await Promise.all(data.map(async spu => {
            return {
                ...spu,
                product_price: await getPriceSpu(spu._id)
            }
        }));
        new SuccessResponse({
            message: 'Get recommend in cart page',
            metadata: spuswithPrice
        }).send(res);
    }

    async getRecommendForProfilePage(req, res) {
        const userId = req.user.userId;

        const personalizedRecs = await advantageRecommendService
            .getCollaborativeRecommendations(userId, 10);

        const spuswithPrice = await Promise.all(personalizedRecs.map(async spu => {
            return {
                ...spu,
                product_price: await getPriceSpu(spu._id)
            }
        }));

        new SuccessResponse({
            message: 'Get recommend in profile page',
            metadata: spuswithPrice
        }).send(res);
    }

    async getRecommendTrending(req, res) {
        const trendingProducts = await advantageRecommendService.getTrendingRecommendations(10);
        const spuswithPrice = await Promise.all(trendingProducts.map(async spu => {
            return {
                ...spu,
                product_price: await getPriceSpu(spu._id)
            }
        }));
        new SuccessResponse({
            message: 'Get recommend in trending page',
            metadata: spuswithPrice
        }).send(res);
    }

}

export default new RecommendationController();