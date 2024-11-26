// elasticsearch.js
import {
    Client
} from '@elastic/elasticsearch';

// Khởi tạo client Elasticsearch
const esClient = new Client({
    node: 'http://localhost:9200'
});

const checkConnection = async () => {
    try {
        const health = await esClient.cluster.health();
        console.log('Elasticsearch is connected:', health);
    } catch (error) {
        console.error('Error connecting to Elasticsearch:', error);
    }
};

// Xuất client và hàm kiểm tra
export {
    esClient,
    checkConnection
};