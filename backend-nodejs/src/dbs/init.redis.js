import redis from 'ioredis';
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

const initIORedis = async () => {
    if (client.instanceRedis) {
        console.log('Redis client is already initialized.');
        return client.instanceRedis;
    }

    const instanceRedis = new redis({
        host: 'localhost',
        port: 6379,
        retryStrategy(times) {
            if (times > 20) {
                console.log('Too many attempts to reconnect. Redis connection was terminated');
                return new Error('Too many retries.');
            }
            return Math.min(times * 500, 2000);
        },
        connectTimeout: 10000,
        lazyConnect: true
    });

    handleEventConnection(instanceRedis);
    await instanceRedis.connect();

    client.instanceRedis = instanceRedis;

    return client.instanceRedis;
};

const getIORedis = () => {
    if (!client.instanceRedis) {
        throw new InternalError('Redis client has not been initialized. Call initIORedis() first.');
    }
    return client;
};

const closeIORedis = () => {
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
    initIORedis,
    getIORedis,
    closeIORedis
};