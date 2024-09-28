import redis from 'redis'
import {
    promisify
} from 'util'
import {
    reservationIventory
} from '../models/repositories/iventory.repo.js'
import {
    getRedis
} from '../dbs/init.redis.js'

const {
    instanceConnect: redisClient
} = getRedis()

const acquireLock = async ({
    productId,
    quantity,
    cartId
}) => {
    const key = `lock_v2024_${productId}`;
    const retryTimes = 10;
    const expireTime = 3000; //3s tam lock

    for (let i = 0; i < retryTimes.length; i++) {
        ///  tạo 1 key, thằng nào cầm key thì được vào thanh toán 
        const result = await redisClient.setNX(key, expireTime)

        if (result === 1) {
            //  thao tac voi inventory
            const isReservation = await reservationIventory({
                productId,
                quantity,
                cartId
            })

            if (isReservation.modifiedCount) {
                await redisClient.pexpire(key, expireTime)
                return key
            }
            return null
        } else {
            await new Promise((resolve) => setTimeout(resolve, 50))
        }
    }
}
const releaseLock = async (keylock) => {
    const delAsyncKey = promisify(redisClient.del).bind(redisClient)
    return await delAsyncKey(keylock);

}
export {
    releaseLock,
    acquireLock
}