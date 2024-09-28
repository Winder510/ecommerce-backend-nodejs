import redis from "redis";

let client = {},
    statusConnectRedis = {
        CONNECT: 'connect',
        END: 'end',
        RECONNECT: 'reconnect',
        ERROR: 'error'
    },
    connectionTimeOut


const REDIS_CONNECT_MESSAGE = {
    code: -99,
    message: {
        vn: 'Redis loi roi',
        en: 'Service connect redis error'
    }
}
const handleTimeOutError = (connectionTimeOut) => {

}
const handleEventConnection = (connectionRedis) => {
    connectionRedis.on(statusConnectRedis.CONNECT, () => {
        console.log(`Status connection Redis: connected`)
    })

    connectionRedis.on(statusConnectRedis.ERROR, (err) => {
        console.log(`Status connection Redis: ${err}`)

    })

    connectionRedis.on(statusConnectRedis.RECONNECT, () => {
        console.log(`Status connection Redis: reconnecting`)

    })

    connectionRedis.on(statusConnectRedis.END, () => {
        console.log(`Status connection Redis: disconnected`)

    })

}
const initRedis = async () => {

    const instanceRedis = await redis.createClient({
        url: 'redis://default:mW9K64A8GSs7CaoPooaT5shUC4KIdAJ3@redis-17635.c252.ap-southeast-1-1.ec2.redns.redis-cloud.com:17635',
        socket: {
            reconnectStrategy: function (retries) {
                if (retries > 20) {
                    console.log("Too many attempts to reconnect. Redis connection was terminated");
                    return new Error("Too many retries.");
                } else {
                    return retries * 500;
                }
            }
        },
        connectTimeout: 10000
    })
    // Kết nối tới Redis

    handleEventConnection(instanceRedis)
    await instanceRedis.connect();

    client.instanceRedis = instanceRedis
}

const getRedis = () => {
    return client
}

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
}

export {
    initRedis,
    getRedis,
    closeRedis
}