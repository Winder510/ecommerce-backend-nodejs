import {
    Client
} from '@elastic/elasticsearch';

// Khởi tạo client Elasticsearch
let esClient;

const initElastic = async () => {
    try {
        esClient = new Client({
            node: 'http://localhost:9200'
        });
        console.log('Elasticsearch is connected');
    } catch (error) {
        console.error('Error connecting to Elasticsearch:', error);
    }
};

export {
    esClient,
    initElastic
};