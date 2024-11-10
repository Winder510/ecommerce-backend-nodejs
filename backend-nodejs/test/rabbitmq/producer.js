import amqp from 'amqplib';
const message = "Fuck you consumer???";

const runProducer = async () => {
    try {
        const connection = await amqp.connect('amqp://localhost')

        const channel = await connection.createChannel();
        const queueName = 'test-topic'

        await channel.assertQueue(queueName, {
            durable: true
        })

        await channel.sendToQueue(queueName, Buffer.from(message))
        console.log("Send message:: ", message)

    } catch (error) {

    }
}

runProducer();