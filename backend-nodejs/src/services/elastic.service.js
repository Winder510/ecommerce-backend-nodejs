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
                                    fields: [
                                        "name^3", // Ưu tiên trường 'name' (tăng trọng số lên 3)
                                        "description" // Trường 'description' có trọng số mặc định
                                    ],
                                    fuzziness: "AUTO", // Hỗ trợ tìm kiếm với lỗi chính tả
                                    operator: "and", // Yêu cầu tất cả các từ trong chuỗi tìm kiếm khớp
                                    type: "best_fields" // Chọn trường có kết quả khớp tốt nhất
                                }
                            }],
                            filter: [{
                                    term: {
                                        isPublished: true // Lọc sản phẩm đã công bố
                                    }
                                },
                                {
                                    term: {
                                        isDraft: false // Lọc sản phẩm không phải bản nháp
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
                                    fields: [
                                        "name^3", // Ưu tiên trường 'name' (tăng trọng số lên 3)
                                        "description" // Trường 'description' có trọng số mặc định
                                    ],
                                    fuzziness: "AUTO", // Hỗ trợ tìm kiếm với lỗi chính tả
                                    operator: "and", // Yêu cầu tất cả các từ trong chuỗi tìm kiếm khớp
                                    type: "best_fields" // Chọn trường có kết quả khớp tốt nhất
                                }
                            }],
                            filter: [{
                                    term: {
                                        isPublished: true // Lọc sản phẩm đã công bố
                                    }
                                },
                                {
                                    term: {
                                        isDraft: false // Lọc sản phẩm không phải bản nháp
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