import connectToRabbitMQ from "../dbs/init.rabbitmq.js";

const sendSyncMessage = async ({
    action,
    data
}) => {
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
    channel.publish(syncExchange, '', Buffer.from(JSON.stringify({
        action,
        data
    })));

    await channel.close();
    await connection.close();
}
const sendNotifitoQueue = async (typeSend, {
    type,
    recipientId,
    senderId,
    options = {}
}) => {
    const {
        channel,
        connection
    } = await connectToRabbitMQ();

    const notificationExchange = 'notification_exchange';
    const notificationQueue = 'notification_queue';
    const notificationRoutingKey = 'notification_routing_key';
    const notificationExchangeDLX = 'notification_exchange_dlx';
    const notificationQueueRoutingKeyDLX = 'notification_queue_routing_key_dlx';

    // Create exchange for notifications
    await channel.assertExchange(notificationExchange, 'direct', {
        durable: true,
    });

    // Create a queue for notifications
    const queueResult = await channel.assertQueue(notificationQueue, {
        durable: true,
        deadLetterExchange: notificationExchangeDLX,
        deadLetterRoutingKey: notificationQueueRoutingKeyDLX,
    });

    // Bind queue with the exchange
    await channel.bindQueue(queueResult.queue, notificationExchange, notificationRoutingKey);

    // Send notification message
    channel.publish(
        notificationExchange,
        notificationRoutingKey,
        Buffer.from(
            JSON.stringify({
                typeSend,
                notifi_data: {
                    type,
                    recipientId,
                    senderId,
                    options,
                    timestamp: new Date().toISOString(),
                }
            })
        )
    );

    // Close the channel and connection
    await channel.close();
    await connection.close();
};



export {
    sendNotifitoQueue,
    sendSyncMessage
}