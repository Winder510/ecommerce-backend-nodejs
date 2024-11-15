import amqp from 'amqplib';
import connectToRabbitMQ from '../../src/dbs/init.rabbitmq.js';

// const runConsumer = async () => {

//     try {
//         const connection = await amqp.connect('amqp://localhost')
//         const channel = await connection.createChannel();
//         const queueName = 'test-topic'

//         await channel.assertQueue(queueName, {
//             durable: true
//         })

//         await channel.consume(queueName, (message) => {
//             console.log(`Received`, message.content.toString())
//             channel.ack(message);
//         }, {
//             noAck: false
//         })

//     } catch (error) {

//     }
// }
// runConsumer();

const consumeSyncMessage = async () => {
    try {
        const {
            channel,
            connection
        } = await connectToRabbitMQ();

        const syncQueue = 'sync_queue';
        setTimeout(() => {
            console.log(`Consumer is waiting for messages in ${syncQueue}...`);
            channel.consume(syncQueue, async (message) => {
                if (message !== null) {
                    const productData = JSON.parse(message.content.toString());
                    console.log(`Received message for synchronization: `, productData);
                    try {
                        channel.ack(message);
                    } catch (error) {
                        console.error("Error processing message:", error);
                        channel.nack(message, false, false);
                    }
                }
            }, {
                noAck: false,
            });
        }, 15000)
    } catch (error) {
        console.log("🚀 ~ Error: ~ error:", error)
    }
}

await consumeSyncMessage();