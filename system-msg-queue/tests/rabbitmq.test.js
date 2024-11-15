import {
    connectToRabbitMQForTest
} from '../dbs/init.rabbitmq.js';

describe("Test the connectToRabbitMQ function", () => {
    it("should connect to RabbitMQ", async () => {
        const result = await connectToRabbitMQForTest();
        expect(result).toBeUndefined();
    });
})