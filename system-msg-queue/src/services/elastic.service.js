// productSync.js
import {
    esClient
} from '../../dbs/init.elastic.js';
import _ from 'lodash';

class ElasticService {
    static syncProductWithElasticsearch = async ({
        action,
        data
    }) => {
        try {
            const indexName = 'products';

            const productData = {
                id: data._id,
                name: data?.product_name,
                thumb: data?.product_thumb,
                description: data?.product_description,
                price: data?.product_price,
                quantity: data?.product_quantity,
                slug: data?.product_slug,
            };
            let response;

            switch (action) {
                case 'add': // Thêm mới sản phẩm
                    response = await esClient.index({
                        index: indexName,
                        id: data._id,
                        body: productData,
                    });
                    console.log('Product added to Elasticsearch:', response);
                    break;

                case 'update': // Cập nhật sản phẩm
                    const updatedData = _.omit(productData, ['id']);
                    response = await esClient.update({
                        index: indexName,
                        id: data._id,
                        body: {
                            doc: updatedData
                        },
                    });
                    console.log('Product updated in Elasticsearch:', response);
                    break;

                case 'delete': // Xóa sản phẩm
                    response = await esClient.delete({
                        index: indexName,
                        id: data._id,
                    });
                    console.log('Product deleted from Elasticsearch:', response);
                    break;

                default:
                    console.error(`Unknown action: ${action}`);
                    return;
            }
        } catch (error) {
            console.error('Error syncing product with Elasticsearch:', error);
        }
    };
}

export default ElasticService;