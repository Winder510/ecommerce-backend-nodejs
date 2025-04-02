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
            status: 200,
            metadata: JSON.parse(spuCache),
            message: "Successfully get spu from cache"
        });
    }

    next();
};

export const readCacheCategory = async (req, res, next) => {

    const categoryKeyCache = `${KEY_CACHE.CATEGORY}-{all}`;

    const categoryCache = await getCacheIO({
        key: categoryKeyCache
    });

    if (categoryCache) {
        return res.status(200).json({
            status: 200,
            metadata: JSON.parse(categoryCache),
            message: "Successfully get category from cache"
        });
    }

    next();
};