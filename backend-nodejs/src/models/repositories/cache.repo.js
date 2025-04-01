import {
    getIORedis
} from '../../dbs/init.redis.js';

// Remove the top-level Redis client initialization
const getRedisInstance = () => {
    const redis = getIORedis().instanceRedis;
    if (!redis) {
        throw new Error('Redis client has not been initialized. Call initIORedis() first.');
    }
    return redis;
};

const setCacheIO = async ({
    key,
    value
}) => {
    try {
        const redisCache = getRedisInstance();
        return await redisCache.set(key, value);
    } catch (error) {
        throw new Error('Failed to set cache value: ' + error.message);
    }
}

const setCacheIOExpiration = async ({
    key,
    value,
    expirationInSeconds
}) => {
    try {
        const redisCache = getRedisInstance();
        return await redisCache.set(key, value, "EX", expirationInSeconds);
    } catch (error) {
        throw new Error('Failed to set cache value: ' + error.message);
    }
}

const getCacheIO = async ({
    key,
}) => {
    try {
        const redisCache = getRedisInstance();
        return await redisCache.get(key);
    } catch (error) {
        throw new Error('Failed to get cache value: ' + error.message);
    }
}

export {
    setCacheIO,
    setCacheIOExpiration,
    getCacheIO,
}