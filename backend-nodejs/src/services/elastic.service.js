// productSync.js
import {
    esClient
} from '../dbs/init.elastic.js';
class ElasticService {
    static searchProduct = async ({
        query,
        page = 1,
        size = 10
    }) => {
        try {
            const from = (page - 1) * size;

            const response = await esClient.search({
                index: 'products',
                body: {
                    from,
                    size,
                    query: {
                        multi_match: {
                            query: query,
                            fields: ['name', 'description'],
                            fuzziness: 'AUTO'
                        }
                    }
                }
            });

            const hits = response.body.hits.hits;
            const products = hits.map(hit => ({
                id: hit._id,
                ...hit._source
            }));

            return products;
        } catch (error) {
            console.error('Error searching for product:', error);
        }
    };

    static suggestSearch = async ({
        textSearch
    }) => {
        try {
            const result = await esClient.search({
                index: 'products',
                body: {
                    query: {
                        multi_match: {
                            query: textSearch,
                            fields: ["name"], // Tìm kiếm theo trường 'name'
                            fuzziness: "AUTO", // Hỗ trợ tìm kiếm với lỗi chính tả
                            type: "best_fields", // Ưu tiên trường có kết quả khớp tốt nhất
                        }
                    }
                }
            });

            // Lấy gợi ý và score từ kết quả trả về
            const suggestions = result.body.hits.hits.map(hit => ({
                name: hit._source.name,
                score: hit._score // Điểm số của gợi ý
            }));

            return suggestions;
        } catch (error) {
            console.error("Error performing autocomplete search:", error);
            return []; // Trả về mảng rỗng nếu có lỗi
        }
    }

}

export default ElasticService;