import amqp from 'amqplib';
const connectToRabbitMQ = async () => {
    try {
        const connection = await amqp.connect('amqp://localhost');
        if (!connection) throw new Error('Failed to connect to RabbitMQ');

        const channel = await connection.createChannel();
        return {
            channel,
            connection
        }
    } catch (e) {}

};

export default connectToRabbitMQ;