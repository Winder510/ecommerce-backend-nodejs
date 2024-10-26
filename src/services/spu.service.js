import _ from 'lodash';
import spuModel from '../models/spu.model.js';
import {
    SkuService
} from './sku.service.js';
import {
    BadRequestError
} from '../core/error.response.js';
import {
    buildQuery,
    findListPublishSpuByCategory,
    publishSpu,
    searchSpuByUser,
    unPublishSpu,
} from '../models/repositories/spu.repo.js';
import {
    CategoryService
} from './category.service.js';
import {
    lowestPriceSKU
} from '../models/repositories/sku.repo.js';

export class SpuService {
    static newSPu = async ({
        name,
        description,
        thumb,
        category,
        quantity,
        attributes,
        variations,
        sku_list = [],
        /*
        sku_list = [  "sku_index": [
                1,
                2
            ],
            "sku_thumb":   "https://example.com/images/macbook-silver.jpg",
            "sku_price": 2900,
            "sku_stock": 2
            ]
        */
    }) => {
        // if (!sku_list.length && !variations) {
        //     return await spuModel.create({
        //         product_name: name,
        //         product_description: description,
        //         product_thumb: thumb,
        //         product_quantity: quantity,
        //         product_category: category,
        //         product_attributes: attributes,
        //     });
        // }

        const product_quantity = sku_list.reduce((acc, sku) => {
            return acc + sku?.sku_stock;
        }, 0);
        const lowestSku = lowestPriceSKU(sku_list);


        const newSpu = await spuModel.create({
            product_name: name,
            product_description: description,
            product_thumb: thumb,
            product_price: lowestSku?.sku_price,
            product_category: category,
            product_attributes: attributes,
            product_quantity,
            product_variations: variations,
        });

        if (newSpu && sku_list.length) {
            await SkuService.newSku({
                spu_id: newSpu._id,
                product_name: name,
                product_variations: variations,
                sku_list,
            });
        }

        // electice search


        return newSpu;
    };

    static async getOneSpu({
        _id
    }) {
        const foundSpu = await spuModel.findById(_id).lean();

        if (!foundSpu) throw new BadRequestError('Spu not exists');

        const sku_list = await SkuService.allSkuBySpu({
            product_id: _id,
        });

        return {
            spu_info: _.omit(foundSpu, ['__v', 'isDeleted', 'updatedAt', 'createdAt']),
            sku_list: sku_list.map((sku) => _.omit(sku, ['__v', 'isDeleted', 'updatedAt', 'createdAt'])),
        };
    }

    static async getListPublishSpuByCategory({
        categoryId = null,
        limit = 10,
        skip = 0
    }) {
        const query = {
            isPublished: true,
            ...(categoryId && {
                product_category: {
                    $elemMatch: {
                        $eq: categoryId,
                    },
                },
            }),
        };
        return await findListPublishSpuByCategory({
            query,
            limit,
            skip,
        });
    }

    static async getListDraftSpuByCategory({
        categoryId = null,
        limit = 10,
        skip = 0
    }) {
        const query = {
            isDraft: true,
            product_category: {
                $elemMatch: {
                    $eq: categoryId,
                },
            },
        };

        return await findListPublishSpuByCategory({
            query,
            limit,
            skip,
        });
    }

    static async publishSpu({
        product_id
    }) {
        return await publishSpu({
            product_id,
        });
    }

    static async unPublishSpu({
        product_id
    }) {
        return await unPublishSpu({
            product_id,
        });
    }

    static async searchSpu({
        keySearch
    }) {
        return await searchSpuByUser({
            keySearch,
        });
    }

    static async getBestSoldSpu({
        categoryId,
        limit = 5,
        skip = 0
    }) {
        const query = {
            isPublished: true,
            product_category: {
                $in: [categoryId],
            },
        };
        const data = await spuModel
            .find(query)
            .select('product_name product_quantitySold product_quantity product_thumb')
            .sort({
                product_quantitySold: -1,
            })
            .skip(skip)
            .limit(limit)
            .lean()
            .exec();

        return data;
    }

    // admin
    static async findAllSpuWithCondition({
        product_status,
        stock_status,
        categoryId,
        sortBy, // sortBy
        order = 'asc',
        limit = 10,
        skip = 0,
    }) {
        const query = buildQuery({
            product_status,
            stock_status,
            categoryId,
        });
        console.log(query);

        const sortOptions = {};
        sortOptions[sortBy] = order === 'asc' ? 1 : -1;

        const products = await spuModel
            .find(query)
            .skip(skip)
            .limit(limit)
            .sort(
                sortOptions || {
                    createdAt: -1,
                },
            )
            .lean()
            .exec();
        return products;
    }

    static async totalRevenueByCategory(categoryId) {
        const spus = await this.getListPublishSpuByCategory({
            categoryId,
        });
        return spus.reduce((acc, spu) => {
            return acc + spu.product_revenue;
        }, 0);
    }

    static async getBestSoldSpuEachCategory() {
        const allCategories = await CategoryService.getParentCategory();
        const data = await Promise.all(
            allCategories.map(async (category) => {
                const bestSold = await this.getBestSoldSpu({
                    categoryId: category._id.toString(),
                    limit: 10,
                });

                const totalRevenue = await this.totalRevenueByCategory(category._id.toString());

                return {
                    category,
                    bestSold,
                    totalRevenue,
                };
            }),
        );

        return data;
    }
}