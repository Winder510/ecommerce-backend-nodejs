// productSync.js
import {
    esClient
} from '../../dbs/init.elastic.js';
class ElasticService {
    static syncProductWithElasticsearch = async (product) => {
        try {
            const productData = {
                id: product._id,
                name: product.product_name,
                description: product.product_description,
                price: product.product_price,
                quantity: product.product_quantity,
                quantitySold: product.product_quantitySold,
                revenue: product.product_revenue,
                ratingAverage: product.product_ratingAverage,
                loyalPointRate: product.loyalPointRate,
                stockStatus: product.product_stockStatus,
                variations: product.product_variations,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt,
                slug: product.product_slug,
            };
            const response = await esClient.index({
                index: 'products',
                id: product._id,
                body: productData,
            });

            console.log('Product synced with Elasticsearch:', response);
        } catch (error) {
            console.error('Error syncing product with Elasticsearch:', error);
        }
    };
}

export default ElasticService;