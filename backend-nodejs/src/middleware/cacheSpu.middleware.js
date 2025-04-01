import {
    KEY_CACHE
} from "../constant/index.js";
import {
    getCacheIO
} from "../models/repositories/cache.repo.js";

export const readCacheSpu = async (req, res, next) => {
    const {
        spu_id
    } = req.query;

    const spuKeyCache = `${KEY_CACHE.SPU}-${spu_id}`;

    const spuCache = await getCacheIO({
        key: spuKeyCache
    });

    if (spuCache) {
        return res.status(200).json({
            success: true,
            data: JSON.parse(spuCache),
            message: "Successfully get spu from cache"
        });
    }

    next();
};