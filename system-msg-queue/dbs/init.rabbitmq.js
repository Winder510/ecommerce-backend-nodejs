import amqp from 'amqplib';

const connectToRabbitMQ = async () => {
    try {
        const connection = await amqp.connect('amqp://rabbitmq_ms:5672');
        if (!connection) throw new Error('Failed to connect to RabbitMQ');

        const channel = await connection.createChannel();
        return {
            channel,
            connection
        };
    } catch (e) {
        console.error("🚀 ~ Error connecting to RabbitMQ:", e);
    }
};

const connectToRabbitMQForTest = async () => {
    try {
        const {
            channel,
            connection
        } = await connectToRabbitMQ();

        // Test
        const queue = 'test_queue';
        const message = "Hello, there!";
        await channel.assertQueue(queue, {
            durable: false
        });
        channel.sendToQueue(queue, Buffer.from(message));

        await connection.close();
    } catch (e) {
        console.log("🚀 ~ Error in test connection:", e);
    }
};

const consumerQueue = async (channel, queueName) => {
    try {
        await channel.assertQueue(queueName, {
            durable: true
        });

        channel.consume(queueName, (msg) => {
            console.log(`Received ${msg.content.toString()}`);
            channel.ack(msg);
        }, {
            noAck: false
        });
    } catch (error) {
        console.error("🚀 ~ Error in consumerQueue:", error);
    }
};

export {
    connectToRabbitMQ,
    connectToRabbitMQForTest,
    consumerQueue
};