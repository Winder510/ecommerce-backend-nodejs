import {
    consumerQueue,
    connectToRabbitMQ
} from '../dbs/init.rabbitmq.js';
import ElasticService from './elastic.service.js';
import {
    processBroadcastNotification,
    processIndividualNotification
} from './notification.service.js';

class MessageService {
    async consumerToQueue(queueName) {
        try {
            const {
                channel,
                connection
            } = await connectToRabbitMQ();
            await consumerQueue(channel, queueName);
        } catch (error) {
            console.log("🚀 ~ Error: ~ error:", error);
        }
    }

    static async consumeSyncData() {
        try {
            const {
                channel,
                connection
            } = await connectToRabbitMQ();
            const syncQueue = 'sync_queue';
            await channel.prefetch(1);
            console.log(`Consumer is waiting for messages in ${syncQueue}...`);
            channel.consume(syncQueue, async (message) => {
                if (message !== null) {
                    const payload = JSON.parse(message.content.toString());
                    ElasticService.syncProductWithElasticsearch(payload)
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

    static async consumeSyncDataFailed() {
        try {
            const {
                channel,
                connection
            } = await connectToRabbitMQ();

            const syncExchangeDLX = 'sync_exchangeDXL';
            const syncQueueRoutingKeyDLX = 'sync_queue_routing_key_DXL';
            const syncQueueHandler = 'synx_falied_msg_queue';

            await channel.assertExchange(syncExchangeDLX, 'direct', {
                durable: true
            });

            // create queue
            const queueResult = await channel.assertQueue(syncQueueHandler, {
                durable: true,
            });

            // bindQueue
            await channel.bindQueue(queueResult.queue, syncExchangeDLX, syncQueueRoutingKeyDLX);

            channel.consume(syncQueueHandler, async (message) => {
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

    static async consumeNotification() {
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
                            await processIndividualNotification(payload.notifi_data);
                            break;
                        case 'BROADCAST':
                            await processBroadcastNotification(payload.notifi_data);
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

    static async consumeNotificationFailed() {
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
}

export default MessageService;