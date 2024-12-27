// recommendation.service.js
import spuModel from '../models/spu.model.js';
import orderModel from '../models/order.model.js';
import userModel from '../models/user.model.js';
import {
    getRedis
} from '../dbs/init.redis.js';
import skuModel from '../models/sku.model.js';
// const redis = new Redis({
//     // Redis config
// });


class AdvancedRecommendationService {
    constructor() {
        this.weights = {
            categoryMatch: 0.3,
            priceMatch: 0.2,
            tagMatch: 0.15,
            rating: 0.2,
            popularity: 0.15
        };

        this.CACHE_TTL = 24 * 60 * 60;
    }

    // Tính similarity score giữa 2 sản phẩm
    async calculateSimilarityScore(product1, product2) {
        let score = 0;

        // Category match
        const categoryMatch = product1.product_category.some(cat =>
            product2.product_category.includes(cat.toString())
        );
        if (categoryMatch) score += this.weights.categoryMatch;

        // Price similarity (trong khoảng ±20%)
        const priceRange = 0.2;
        const minPrice = product1.product_price * (1 - priceRange);
        const maxPrice = product1.product_price * (1 + priceRange);
        if (product2.product_price >= minPrice && product2.product_price <= maxPrice) {
            score += this.weights.priceMatch;
        }

        // Tag similarity
        const commonTags = product1.product_tags.filter(tag =>
            product2.product_tags.includes(tag)
        );
        score += (commonTags.length / Math.max(product1.product_tags.length, 1)) * this.weights.tagMatch;

        // Rating score
        score += (product2.product_ratingAverage / 5) * this.weights.rating;

        // Popularity score (normalized based on highest selling product)
        const maxSold = await this.getMaxQuantitySold();
        score += (product2.product_quantitySold / maxSold) * this.weights.popularity;

        return score;
    }

    // Lấy collaborative recommendations dựa trên user behavior
    async getCollaborativeRecommendations(userId, limit = 5) {
        // Lấy sản phẩm user đã mua
        const userOrders = await orderModel.find({
            order_userId: userId
        });
        const userProducts = userOrders.flatMap(order => order.order_products.map(p => p.spuId));

        // Tìm users khác đã mua các sản phẩm tương tự
        const similarUsers = await orderModel.find({
            'order_products.spuId': {
                $in: userProducts
            },
            order_userId: {
                $ne: userId
            }
        }).distinct('order_userId');

        // Lấy sản phẩm từ similar users
        const recommendedProducts = await orderModel.aggregate([{
                $match: {
                    order_userId: {
                        $in: similarUsers
                    },
                    'order_products.spuId': {
                        $nin: userProducts
                    }
                }
            },
            {
                $unwind: '$order_products'
            },
            {
                $group: {
                    _id: '$order_products.spuId',
                    score: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    score: -1
                }
            },
            {
                $limit: limit
            }
        ]);

        return spuModel.find({
            _id: {
                $in: recommendedProducts.map(p => p._id)
            }
        });
    }

    // Content-based recommendations với caching
    async getContentBasedRecommendations(productId, limit = 5) {
        // const {
        //     instanceRedis: redis
        // } = getRedis();

        // const cacheKey = `recommendations:${productId}:${limit}`;

        // // Kiểm tra cache
        // const cachedResults = await redis.get(cacheKey);
        // if (cachedResults) {
        //     return JSON.parse(cachedResults);
        // }

        const product = await spuModel.findById(productId);
        if (!product) throw new Error('Product not found');

        // Lấy tất cả sản phẩm active
        const allProducts = await spuModel.find({
            _id: {
                $ne: productId
            },
            isPublished: true,
            isDeleted: false
        }).lean();

        // Tính similarity scores
        const productsWithScores = await Promise.all(
            allProducts.map(async (p) => ({
                product: p,
                score: await this.calculateSimilarityScore(product, p)
            }))
        );

        // Sắp xếp và lấy top products
        const recommendations = productsWithScores
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(p => p.product);

        // // Cache kết quả
        // await redis.set(
        //     cacheKey,
        //     JSON.stringify(recommendations),
        //     'EX',
        //     this.CACHE_TTL
        // );

        return recommendations;
    }

    // Hybrid recommendations kết hợp nhiều phương pháp
    async getHybridRecommendations({
        userId,
        productId,
        limit = 5
    }) {
        try {
            let collaborativeRecs = [],
                contentBasedRecs = [];
            try {
                collaborativeRecs = await this.getCollaborativeRecommendations(userId, limit) || [];
            } catch (err) {
                console.error('Error getting collaborative recs:', err);
            }

            try {
                contentBasedRecs = await this.getContentBasedRecommendations(productId, limit) || [];
            } catch (err) {
                console.error('Error getting content-based recs:', err);
            }

            // Ensure arrays and remove duplicates
            const hybridRecs = Array.from(new Set([
                ...(Array.isArray(collaborativeRecs) ? collaborativeRecs : []),
                ...(Array.isArray(contentBasedRecs) ? contentBasedRecs : [])
            ]));

            if (hybridRecs.length < limit) {
                const popularProducts = await this.findPopularProducts({
                    limit: limit - hybridRecs.length
                });
                hybridRecs.push(...popularProducts);
            }

            return hybridRecs.slice(0, limit);
        } catch (error) {
            console.error('Error in hybrid recommendations:', error);
            return this.findPopularProducts({
                limit
            });
        }
    }

    // Segmentation-based recommendations
    async getSegmentBasedRecommendations(userId, limit = 5) {
        const user = await userModel.findById(userId).lean();
        if (!user) throw new Error('User not found');

        // Xác định segment của user (có thể dựa vào age, location, purchase history...)
        const userSegment = await this.determineUserSegment(user);

        // Lấy top products cho segment này
        return await spuModel.find({
                targetSegments: userSegment,
                isPublished: true,
                isDeleted: false
            })
            .sort({
                product_ratingAverage: -1,
                product_quantitySold: -1
            })
            .limit(limit).lean();
    }

    async determineUserSegment(user) {
        // Implement user segmentation logic here
        // Có thể dựa vào:
        // - Demographics (age, gender, location)
        // - Purchase behavior (frequency, average order value)
        // - Browse history
        // - Wishlist
        // Return segment identifier
    }

    // Helper methods
    async getMaxQuantitySold() {
        const topProduct = await spuModel.findOne({
                isPublished: true,
                isDeleted: false
            })
            .sort({
                product_quantitySold: -1
            });

        return topProduct ? topProduct.product_quantitySold : 1;
    }


    // Seasonal/Trending recommendations
    async getTrendingRecommendations(limit = 5) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return await spuModel.aggregate([{
                $match: {
                    isPublished: true,
                    isDeleted: false,
                    createdAt: {
                        $gte: thirtyDaysAgo
                    }
                }
            },
            {
                $addFields: {
                    trendScore: {
                        $add: [{
                                $multiply: ['$product_quantitySold', 0.5]
                            },
                            {
                                $multiply: ['$product_ratingAverage', 0.3]
                            },
                            {
                                $multiply: ['$product_revenue', 0.2]
                            }
                        ]
                    }
                }
            },
            {
                $sort: {
                    trendScore: -1
                }
            },
            {
                $limit: limit
            }
        ]);
    }

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
                .limit(limit).lean();

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
                .limit(limit).lean();
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
                .limit(limit).lean();
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
                .limit(limit).lean();
        } catch (error) {
            throw new Error(`Error finding products by price range: ${error.message}`);
        }
    }

}

export default new AdvancedRecommendationService();