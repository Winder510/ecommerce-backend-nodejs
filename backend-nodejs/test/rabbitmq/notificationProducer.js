import connectToRabbitMQ from "../../src/dbs/init.rabbitmq.js";

// constants.js
const RABBITMQ_CONSTANTS = {
    EXCHANGES: {
        NOTIFICATION: 'notification_exchange',
        DLX: 'notification_exchange_dlx'
    },
    QUEUES: {
        INDIVIDUAL: 'individual_notification_queue',
        BROADCAST: 'broadcast_notification_queue',
        FAILED: 'notification_failed_msg_queue'
    },
    ROUTING_KEYS: {
        INDIVIDUAL: 'individual_notification_key',
        BROADCAST: 'broadcast_notification_key',
        DLX: 'notification_queue_dlx'
    },
    TYPES: {
        INDIVIDUAL: 'INDIVIDUAL',
        BROADCAST: 'BROADCAST'
    }
};

// notificationService.js
class NotificationService {
    constructor(config = {}) {
        this.channel = null;
        this.connection = null;
        this.config = {
            maxRetries: config.maxRetries || 3,
            retryDelay: config.retryDelay || 5000,
            messageExpiration: config.messageExpiration || 86400000, // 24h
            reconnectAttempts: config.reconnectAttempts || 5,
            reconnectDelay: config.reconnectDelay || 5000
        };
    }

    async initialize() {
        try {
            const {
                channel,
                connection
            } = await connectToRabbitMQ();

            this.channel = channel;
            this.connection = connection;

            // Setup connection error handling
            this.connection.on('error', (err) => {
                console.error('Connection error:', err);
                this.handleConnectionError();
            });

            this.connection.on('close', () => {
                console.log('Connection closed, attempting to reconnect...');
                this.handleConnectionError();
            });

            // Setup exchanges and queues
            await this.setupExchangesAndQueues();
            return true;
        } catch (error) {
            console.error('Failed to initialize NotificationService:', error);
            throw error;
        }
    }

    async handleConnectionError(retryCount = 0) {
        if (retryCount < this.config.reconnectAttempts) {
            setTimeout(async () => {
                try {
                    await this.initialize();
                    console.log('Successfully reconnected');
                } catch (error) {
                    console.error('Reconnection attempt failed:', error);
                    await this.handleConnectionError(retryCount + 1);
                }
            }, this.config.reconnectDelay);
        } else {
            console.error('Max reconnection attempts reached');
            // Implement your error handling strategy here
        }
    }

    async setupExchangesAndQueues() {
        const {
            EXCHANGES,
            QUEUES,
            ROUTING_KEYS
        } = RABBITMQ_CONSTANTS;

        // Setup exchanges
        await this.channel.assertExchange(EXCHANGES.NOTIFICATION, 'direct', {
            durable: true
        });
        await this.channel.assertExchange(EXCHANGES.DLX, 'direct', {
            durable: true
        });

        // Setup individual notification queue
        const individualQueue = await this.channel.assertQueue(QUEUES.INDIVIDUAL, {
            durable: true,
            deadLetterExchange: EXCHANGES.DLX,
            deadLetterRoutingKey: ROUTING_KEYS.DLX
        });

        await this.channel.bindQueue(
            individualQueue.queue,
            EXCHANGES.NOTIFICATION,
            ROUTING_KEYS.INDIVIDUAL
        );

        // Setup broadcast notification queue
        const broadcastQueue = await this.channel.assertQueue(QUEUES.BROADCAST, {
            durable: true,
            deadLetterExchange: EXCHANGES.DLX,
            deadLetterRoutingKey: ROUTING_KEYS.DLX
        });

        await this.channel.bindQueue(
            broadcastQueue.queue,
            EXCHANGES.NOTIFICATION,
            ROUTING_KEYS.BROADCAST
        );

        // Setup DLX queue
        const dlxQueue = await this.channel.assertQueue(QUEUES.FAILED, {
            durable: true
        });

        await this.channel.bindQueue(
            dlxQueue.queue,
            EXCHANGES.DLX,
            ROUTING_KEYS.DLX
        );
    }

    async sendNotification(typeSend, {
        type,
        recipientId,
        senderId,
        options = {}
    }) {
        try {
            if (!this.channel) {
                await this.initialize();
            }

            const {
                EXCHANGES,
                ROUTING_KEYS,
                TYPES
            } = RABBITMQ_CONSTANTS;

            const message = {
                typeSend,
                notifi_data: {
                    type,
                    recipientId,
                    senderId,
                    options,
                    timestamp: new Date().toISOString()
                }
            };

            const routingKey = typeSend === TYPES.BROADCAST ?
                ROUTING_KEYS.BROADCAST :
                ROUTING_KEYS.INDIVIDUAL;

            const result = await this.channel.publish(
                EXCHANGES.NOTIFICATION,
                routingKey,
                Buffer.from(JSON.stringify(message)), {
                    persistent: true,
                    expiration: this.config.messageExpiration.toString(),
                    priority: options.priority || 0,
                    headers: {
                        'x-retry-count': 0
                    }
                }
            );

            return result;
        } catch (error) {
            console.error('Error sending notification:', error);
            throw error;
        }
    }

    async startConsumer(processMessage) {
        try {
            if (!this.channel) {
                await this.initialize();
            }

            const {
                QUEUES,
                TYPES
            } = RABBITMQ_CONSTANTS;

            // Start individual notifications consumer
            await this.channel.consume(
                QUEUES.INDIVIDUAL,
                async (message) => {
                    await this.handleMessage(message, processMessage, TYPES.INDIVIDUAL);
                }, {
                    noAck: false
                }
            );

            // Start broadcast notifications consumer
            await this.channel.consume(
                QUEUES.BROADCAST,
                async (message) => {
                    await this.handleMessage(message, processMessage, TYPES.BROADCAST);
                }, {
                    noAck: false
                }
            );

            console.log('Consumers started successfully');
        } catch (error) {
            console.error('Error starting consumers:', error);
            throw error;
        }
    }

    async handleMessage(message, processMessage, type) {
        const startTime = Date.now();
        try {
            if (!message) return;

            const payload = JSON.parse(message.content.toString());
            await processMessage(payload);
            this.channel.ack(message);

        } catch (error) {
            console.error('Error processing message:', error);
            this.channel.nack(message, false, false);
        }
    }

    async startFailedMessageConsumer() {
        try {
            if (!this.channel) {
                await this.initialize();
            }

            const {
                QUEUES
            } = RABBITMQ_CONSTANTS;

            return this.channel.consume(
                QUEUES.FAILED,
                async (message) => {
                    try {
                        if (!message) return;

                        const payload = JSON.parse(message.content.toString());
                        const retryCount = (message.properties.headers['x-retry-count'] || 0) + 1;

                        if (retryCount <= this.config.maxRetries) {
                            setTimeout(() => {
                                this.sendNotification(payload.typeSend, payload.notifi_data, {
                                    headers: {
                                        'x-retry-count': retryCount
                                    }
                                });
                            }, this.config.retryDelay * retryCount);
                        } else {
                            // Log permanently failed message
                            await this.handlePermanentFailure(payload);
                        }

                        this.channel.ack(message);
                    } catch (error) {
                        console.error('Error processing failed message:', error);
                        this.channel.nack(message, false, false);
                    }
                }, {
                    noAck: false
                }
            );
        } catch (error) {
            console.error('Error starting failed message consumer:', error);
            throw error;
        }
    }

    async handlePermanentFailure(payload) {
        // Implement your permanent failure handling logic here
        // e.g., store in database, send alerts, etc.
        console.error('Message permanently failed:', payload);
    }


    async shutdown() {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
        } catch (error) {
            console.error('Error shutting down NotificationService:', error);
            throw error;
        }
    }
}

// usage.js
const notificationService = new NotificationService({
    maxRetries: 3,
    retryDelay: 5000,
    messageExpiration: 86400000,
    reconnectAttempts: 5,
    reconnectDelay: 5000
});

// Example usage
async function main() {
    try {
        await notificationService.initialize();

        await notificationService.startFailedMessageConsumer();

        // Send test notifications
        await notificationService.sendNotification(
            RABBITMQ_CONSTANTS.TYPES.INDIVIDUAL, {
                type: "MESSAGE",
                recipientId: "user123",
                senderId: "system",
                options: {
                    priority: 1
                }
            }
        );

        await notificationService.sendNotification(
            RABBITMQ_CONSTANTS.TYPES.BROADCAST, {
                type: "ANNOUNCEMENT",
                recipientId: "all",
                senderId: "system",
                options: {
                    priority: 2
                }
            }
        );


        // Start consumers
        await notificationService.startConsumer(async (payload) => {
            switch (payload.typeSend) {
                case RABBITMQ_CONSTANTS.TYPES.INDIVIDUAL:
                    console.log("Consume message INDIVIDUAL: ", payload)
                    //   await processIndividualNotification(payload);
                    break;
                case RABBITMQ_CONSTANTS.TYPES.BROADCAST:
                    console.log("Consume message BROADCAST: ", payload)

                    //  await processBroadcastNotification(payload);
                    break;
                default:
                    console.log('Unknown notification type:', payload.typeSend);
            }
        });

    } catch (error) {
        console.error('Error in main:', error);
    }
}

process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await notificationService.shutdown();
    process.exit(0);
});

main()
export default notificationService;