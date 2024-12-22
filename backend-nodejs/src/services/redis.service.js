import {
    reservationIventory
} from '../models/repositories/iventory.repo.js';
import {
    getRedis
} from '../dbs/init.redis.js';
import {
    reservationSku
} from '../models/repositories/sku.repo.js';

const acquireLock = async ({
    productId,
    quantity,
    cartId
}) => {
    const {
        instanceRedis: redisClient
    } = getRedis();

    const key = `lock_v2024_${productId}`;
    const retryTimes = 10;
    const expireTime = 3000; //3s tam lock

    for (let i = 0; i < retryTimes; i++) {
        ///  tạo 1 key, thằng nào cầm key thì được vào thanh toán
        const result = await redisClient.setNX(key, 'locked');

        if (result === true) {
            //  thao tac voi inventory
            const isReservation = await reservationIventory({
                productId,
                quantity,
                cartId,
            });
            if (isReservation.modifiedCount) {
                await redisClient.pExpire(key, expireTime);
                return key;
            }

            return null;
        } else {
            await new Promise((resolve) => setTimeout(resolve, 50));
        }
    }
};
const releaseLock = async (keylock) => {
    const {
        instanceRedis: redisClient
    } = getRedis();
    return await redisClient.del(keylock);
};
const acquireLockV2 = async ({
    skuId,
    quantity
}) => {
    const {
        instanceRedis: redisClient
    } = getRedis();

    const key = `lock_v2024_${skuId}`;
    const retryTimes = 10;
    const expireTime = 3000;

    for (let i = 0; i < retryTimes; i++) {
        ///  tạo 1 key, thằng nào cầm key thì được vào thanh toán
        const result = await redisClient.setNX(key, 'locked');

        if (result === true) {
            const isReservation = await reservationSku({
                skuId,
                quantity,
            });
            if (isReservation.modifiedCount) {
                await redisClient.pExpire(key, expireTime);
                return key;
            }

            return null;
        } else {
            await new Promise((resolve) => setTimeout(resolve, 50));
        }
    }
};

export {
    releaseLock,
    acquireLock,
    acquireLockV2
};