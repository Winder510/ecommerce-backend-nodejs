import redis from 'redis';
import {
    InternalError
} from '../core/error.response.js';

let client = {};
const statusConnectRedis = {
    CONNECT: 'connect',
    END: 'end',
    RECONNECT: 'reconnect',
    ERROR: 'error',
};

const handleEventConnection = (connectionRedis) => {
    connectionRedis.on(statusConnectRedis.CONNECT, () => {
        console.log(`Status connection Redis: connected`);
    });

    connectionRedis.on(statusConnectRedis.ERROR, (err) => {
        console.log(`Status connection Redis: ${err}`);
    });

    connectionRedis.on(statusConnectRedis.RECONNECT, () => {
        console.log(`Status connection Redis: reconnecting`);
    });

    connectionRedis.on(statusConnectRedis.END, () => {
        console.log(`Status connection Redis: disconnected`);
    });
};

const initRedis = async () => {
    if (client.instanceRedis) {
        console.log('Redis client is already initialized.');
        return client.instanceRedis;
    }

    const instanceRedis = await redis.createClient({
        url: 'redis://localhost:6379', //redis://localhost:6379
        socket: {
            reconnectStrategy: function (retries) {
                console.log(retries);
                if (retries > 20) {
                    console.log('Too many attempts to reconnect. Redis connection was terminated');
                    return new Error('Too many retries.');
                } else {
                    return retries * 500;
                }
            },
        },
        connectTimeout: 10000,
    });

    handleEventConnection(instanceRedis);
    await instanceRedis.connect();

    client.instanceRedis = instanceRedis;

    return client.instanceRedis;
};

const getRedis = () => {
    if (!client.instanceRedis) {
        throw new InternalError('Redis client has not been initialized. Call initRedis() first.');
    }
    return client;
};

const closeRedis = () => {
    if (client.instanceRedis) {
        client.instanceRedis.quit((err, res) => {
            if (err) {
                console.error('Error closing Redis connection:', err);
            } else {
                console.log('Redis connection closed successfully:', res);
            }
        });
    } else {
        console.log('No Redis connection to close.');
    }
};

export {
    initRedis,
    getRedis,
    closeRedis
};