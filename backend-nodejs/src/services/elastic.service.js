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
        minPrice,
        maxPrice,
        limit = 10,
        skip = 0,
        sortBy,
    }) => {
        try {

            const response = await esClient.search({
                index: 'products',
                body: {
                    query: {
                        bool: {
                            must: [{
                                    multi_match: {
                                        query: textSearch,
                                        fields: ["name"], // Tìm kiếm trong trường 'name'
                                        fuzziness: "AUTO", // Hỗ trợ tìm kiếm với lỗi chính tả
                                        operator: "and", // Tìm kiếm chính xác các từ trong chuỗi
                                        type: "best_fields" // Ưu tiên trường có kết quả khớp tốt nhất
                                    }
                                },
                                {
                                    term: {
                                        isPublished: true // Điều kiện lọc: sản phẩm đã được công bố
                                    }
                                },
                                {
                                    term: {
                                        isDraft: false // Điều kiện lọc: sản phẩm không phải là bản nháp
                                    }
                                }
                            ]
                        }
                    }

                }
            });

            const hits = response.body.hits.hits;

            const productIds = hits.map(hit => hit._id);

            return await getSpuByIds(productIds, {
                minPrice,
                maxPrice,
                limit,
                skip,
                sortBy,
            });
        } catch (error) {
            console.error('Error searching for product:', error);
            return [];
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
                        bool: {
                            must: [{
                                    multi_match: {
                                        query: textSearch,
                                        fields: ["name"], // Tìm kiếm trong trường 'name'
                                        fuzziness: "AUTO", // Hỗ trợ tìm kiếm với lỗi chính tả
                                        operator: "and", // Tìm kiếm chính xác các từ trong chuỗi
                                        type: "best_fields" // Ưu tiên trường có kết quả khớp tốt nhất
                                    }
                                },
                                {
                                    term: {
                                        isPublished: true
                                    }
                                },
                                {
                                    term: {
                                        isDraft: false
                                    }
                                }
                            ]
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