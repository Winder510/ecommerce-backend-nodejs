// productSync.js
import {
    esClient
} from '../dbs/init.elastic.js';
import {
    getSpuByIds
} from '../models/repositories/spu.repo.js';
class ElasticService {
    static searchProduct = async ({
        textSearch,
        page = 1,
        size = 10,
        sort = {
            product_quantitySold: -1
        },
        filter = ""
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
                            query: textSearch,
                            fields: ["name"], // Tìm kiếm trong trường 'name'
                            fuzziness: "AUTO", // Hỗ trợ tìm kiếm với lỗi chính tả
                            operator: "and", // Tìm kiếm chính xác các từ trong chuỗi
                            type: "best_fields" // Ưu tiên trường có kết quả khớp tốt nhất
                        }
                    },

                }
            });

            const hits = response.body.hits.hits;

            const productIds = hits.map(hit => hit._id);

            return await getSpuByIds(productIds, filter, sort);
        } catch (error) {
            console.error('Error searching for product:', error);
            return []; // Trả về mảng rỗng nếu có lỗi
        }
    };

    static suggestSearch = async ({
        textSearch
    }) => {
        try {
            const result = await esClient.search({
                index: 'products',
                body: {
                    size: 5,
                    query: {
                        multi_match: {
                            query: textSearch,
                            fields: ["name"], // Tìm kiếm trong trường 'name'
                            fuzziness: "AUTO", // Hỗ trợ tìm kiếm với lỗi chính tả
                            operator: "and", // Tìm kiếm chính xác các từ trong chuỗi
                            type: "best_fields" // Ưu tiên trường có kết quả khớp tốt nhất
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