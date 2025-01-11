import connectToRabbitMQ from '../../src/dbs/init.rabbitmq.js'

const consumeNotification = async () => {
    try {
        const {
            channel,
            connection
        } = await connectToRabbitMQ();
        const syncQueue = 'notification_queue';

        console.log(`Consumer is waiting for messages in ${syncQueue}...`);
        channel.consume(syncQueue, async (message) => {
            if (message) {
                const payload = JSON.parse(message.content.toString());
                // Kiểm tra loại thông báo
                switch (payload.typeSend) {
                    case 'INDIVIDUAL':
                        console.log("Consume notification individual : >> ", payload.notifi_data)
                        break;
                    case 'BROADCAST':
                        console.log("Consume notification broadcast : >> ", payload.notifi_data)
                        break;
                    default:
                        console.log('Unknown notification type:', notificationData.type);
                }

                channel.ack(message);
            }
        }, {
            noAck: false,
        });
    } catch (error) {
        console.error("Error processing message:", error);
        if (channel && message) {
            channel.nack(message, false, false);
        }
    }
}

const consumeNotificationFailed = async () => {
    try {
        const {
            channel,
            connection
        } = await connectToRabbitMQ();

        const notificationExchangeDLX = 'notification_exchange_dlx';
        const notificationQueueRoutingKeyDLX = 'notification_queue_routing_key_dlx';
        const notificationQueueHandler = 'notification_falied_msg_queue';

        await channel.assertExchange(notificationExchangeDLX, 'direct', {
            durable: true
        });

        // create queue
        const queueResult = await channel.assertQueue(notificationQueueHandler, {
            durable: true,
        });

        // bindQueue
        await channel.bindQueue(queueResult.queue, notificationExchangeDLX, notificationQueueRoutingKeyDLX);

        channel.consume(notificationQueueHandler, async (message) => {
            if (message !== null) {
                const productData = JSON.parse(message.content.toString());
                console.log(`Received failed message for synchronization: `, productData);
                channel.ack(message);
            }
        }, {
            noAck: false,
        });
    } catch (error) {
        console.error("Error processing message:", error);
        if (channel && message) {
            channel.nack(message, false, false);
        }
    }
}

consumeNotification();
consumeNotificationFailed();