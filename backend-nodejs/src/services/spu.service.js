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
    buildQueryForClient,
    publishSpu,
    querySpu,
    searchSpuByUser,
    unPublishSpu,
} from '../models/repositories/spu.repo.js';
import {
    CategoryService
} from './category.service.js';
import {
    lowestPriceSKU
} from '../models/repositories/sku.repo.js';
import sendSyncMessage from '../../test/rabbitmq/sync-data.producerDLX.js';
import skuModel from '../models/sku.model.js';
import categoryModel from '../models/category.model.js';

export class SpuService {

    static async newSPu({
        name,
        description,
        thumb,
        category,
        attributes = [],
        variations,
        tags,
        sku_list = [],
        // sku_list = [  "sku_index": [
        //         1,
        //         2
        //     ],
        //    
        //     "sku_price": 2900,
        //     "sku_stock": 2
        //     ]

    }) {
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
            product_tags: tags
        });

        if (newSpu && sku_list.length) {
            await SkuService.newSku({
                spu_id: newSpu._id,
                product_name: name,
                product_variations: variations,
                sku_list,
            });
        }

        // sync data via elasticsearch
        sendSyncMessage({
            action: "add",
            data: newSpu
        })

        return newSpu;
    };

    static async updateSpu({
        id,
        name,
        description,
        thumb,
        category,
        attributes,
        variations,
        sku_list = [],
    }) {
        const product_quantity = sku_list.reduce((acc, sku) => {
            return acc + sku?.sku_stock;
        }, 0);
        const lowestSku = lowestPriceSKU(sku_list);

        const updated = await spuModel.findOneAndUpdate({
            _id: id
        }, {
            product_name: name,
            product_description: description,
            product_thumb: thumb,
            product_price: lowestSku?.sku_price,
            product_category: category,
            product_attributes: attributes,
            product_quantity,
            product_variations: variations,
        })

        if (updated && sku_list.length) {
            await SkuService.updateSku({
                spu_id: id,
                product_name: name,
                product_variations: variations,
                sku_list,
            });
        }

        const updatedSpu = await spuModel.findById(id).lean();

        sendSyncMessage({
            action: "update",
            data: updatedSpu
        })

        return updatedSpu;
    }

    static async deleteSpu({
        spuId
    }) {
        const foundSpu = await spuModel.findById(spuId).lean();
        if (!foundSpu) throw new BadRequestError("Product not exists")

        await skuModel.deleteMany({
            product_id: spuId
        });

        const deletedSpu = await spuModel.findByIdAndDelete(spuId);

        sendSyncMessage({
            action: "delete",
            data: foundSpu
        });

        return deletedSpu;
    }

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
        categorySlug = null,
        limit = 10,
        skip = 0
    }) {
        const category = await categoryModel.findOne({
            category_slug: categorySlug
        })
        if (!category) throw new BadRequestError("Không tìm thấy category")
        const categoryId = category._id;
        console.log("🚀 ~ SpuService ~ categoryId:", categoryId)

        const query = {
            isPublished: true,
            isDraft: false,
            ...(categoryId && {
                product_category: {
                    $in: [categoryId], // Thay đổi từ $elemMatch sang $in
                },
            }),
        };

        return await querySpu({
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

        return await querySpu({
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


    static async findAlLDraftSpu({
        limit = 10,
        skip = 0
    }) {
        const query = {
            isDraft: true,
        };

        return await querySpu({
            query,
            limit,
            skip,
        });
    }

    static async findAllPublishSpu({
        limit = 10,
        skip = 0
    }) {
        const query = {
            isDraft: false,
            isPublished: true,
        };

        return await querySpu({
            query,
            limit,
            skip,
        });
    }

    static async findAllSpu({
        limit = 10,
        skip = 0
    }) {
        const query = {};

        return await querySpu({
            query,
            limit,
            skip,
        });
    }


    // filter for client in search page
    static async findAllSpuWithCondition({
        product_status,
        stock_status,
        minPrice,
        maxPrice,
        categoryId,
        sortBy,
        order = 'asc',
        limit = 10,
        skip = 0,
    }) {
        // Xây dựng query
        const query = buildQueryForClient({
            product_status,
            stock_status,
            categoryId,
            minPrice,
            maxPrice,
        });

        // Xử lý sort
        let sortOptions = {};
        switch (sortBy) {
            case 'price_asc':
                sortOptions.product_price = 1;
                break;
            case 'price_desc':
                sortOptions.product_price = -1;
                break;
            case 'best_selling':
                sortOptions.product_quantitySold = -1;
                break;
            default:
                sortOptions.createdAt = -1;
        }

        // Thực hiện truy vấn

        return await querySpu({
            query,
            limit,
            skip,
        });
    }


    // filter for admin 
}