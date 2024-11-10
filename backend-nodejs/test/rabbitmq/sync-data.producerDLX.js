import connectToRabbitMQ from '../../src/dbs/init.rabbitmq.js';

const sendSyncMessage = async (productData) => {
    const {
        channel,
        connection
    } = await connectToRabbitMQ();


    const syncExchange = 'sync_exchange';
    const syncQueue = 'sync_queue';
    const syncExchangeDLX = 'sync_exchangeDXL';
    const syncQueueRoutingKeyDLX = 'sync_queue_routing_key_DXL';

    // create exchange 
    await channel.assertExchange(syncExchange, 'direct', {
        durable: true
    });

    // create queue
    const queueResult = await channel.assertQueue(syncQueue, {
        durable: true,
        deadLetterExchange: syncExchangeDLX,
        deadLetterRoutingKey: syncQueueRoutingKeyDLX
    })

    // bindQueue
    await channel.bindQueue(queueResult.queue, syncExchange)

    // send message
    channel.publish(syncExchange, '', Buffer.from(JSON.stringify(productData)));

    await channel.close();
    await connection.close();
}

export default sendSyncMessage;