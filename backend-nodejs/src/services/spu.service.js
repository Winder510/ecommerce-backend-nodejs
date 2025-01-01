import _ from 'lodash';
import spuModel from '../models/spu.model.js';
import {
    SkuService
} from './sku.service.js';
import {
    BadRequestError
} from '../core/error.response.js';
import {
    buildQueryForClient,
    getPriceSpu,
    publishSpu,
    querySpu,
    querySpuV2,
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
import promotionModel from '../models/promotion.model.js';
import PromotionService from './promotion.service.js';

export class SpuService {

    static async newSPu({
        name,
        description,
        thumb,
        more_imgs,
        category,
        attributes = [],
        variations,
        tags,
        ratingAverage,
        sku_list = [],
        isDraft,
        isPublished,
        isDeleted
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
            product_tags: tags,
            product_more_imgs: more_imgs,
            product_ratingAverage: ratingAverage,
            isDraft,
            isPublished,
            isDeleted
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
        more_imgs,
        category,
        attributes = [],
        variations,
        tags,
        sku_list = []
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
            product_tags: tags,
            product_more_imgs: more_imgs,
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
        const currentTime = new Date();
        currentTime.setHours(currentTime.getHours() + 7);

        const isInPromotion = await promotionModel.find({
            "appliedProduct.spuId": spuId,
            startTime: {
                $lte: currentTime
            },
            endTime: {
                $gte: currentTime
            },
            status: 'active',
        }).lean()

        if (isInPromotion) throw new BadRequestError(`Sản phẩm này đang trong thời gian sự kiện ${isInPromotion[0].prom_name} không thể xóa. Hãy thử lại khi sự kiện kết thúc`)

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

        const query = {
            isPublished: true,
            isDraft: false,
            ...(categoryId && {
                product_category: {
                    $in: [categoryId], // Thay đổi từ $elemMatch sang $in
                },
            }),
        };

        return await querySpuV2({
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
    static async publishSpu({
        spuId
    }) {
        return await publishSpu({
            product_id: spuId,
        });
    }

    static async unPublishSpu({
        spuId
    }) {
        return await unPublishSpu({
            product_id: spuId,
        });
    }

    static async totalRevenueByCategory(categorySlug) {
        const spus = await this.getListPublishSpuByCategory({
            categorySlug,
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

                const totalRevenue = await this.totalRevenueByCategory(category.category_slug.toString());

                return {
                    category,
                    bestSold,
                    totalRevenue,
                };
            }),
        );

        return data;
    }


    static async getProductForHomePage() {
        try {
            const allCategories = await CategoryService.getParentCategory();

            const data = await Promise.all(allCategories.map(async (category) => {
                const products = await spuModel.find({
                        isPublished: true,
                        isDeleted: false,
                        product_category: {
                            $in: [category._id],
                        },
                    })
                    .sort({
                        createdAt: -1,
                        product_quantitySold: -1
                    })
                    .limit(8)
                    .lean();


                const spusWithPrice = await Promise.all(products.map(async spu => {
                    return {
                        ...spu,
                        product_price: await getPriceSpu(spu._id)
                    }
                }));

                return {
                    category: {
                        _id: category._id,
                        name: category.name,
                        slug: category.slug
                    },
                    spusWithPrice
                };
            }));

            return data;
        } catch (error) {
            throw new Error(`Error getting products for homepage: ${error.message}`);
        }
    }



    static async findAlLDraftSpu({
        limit = 10,
        page = 1
    }) {
        const query = {
            isDraft: true,
        };

        const skip = (page - 1) * limit;
        // Get total count of matching documents
        const totalResult = await spuModel.countDocuments(query);

        // Calculate total pages
        const totalPages = Math.ceil(totalResult / limit);

        const spus = await spuModel
            .find(query)
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'product_category',
                select: 'category_name',
            })
            .lean()
            .exec();

        return ({
            products: spus,
            pagination: {
                totalResult,
                totalPages,
                currentPage: page,
            }
        })

    }

    static async findAllPublishSpu({
        limit = 10,
        page = 1
    }) {
        const query = {
            isDraft: false,
            isPublished: true,
        };
        const skip = (page - 1) * limit;
        // Get total count of matching documents
        const totalResult = await spuModel.countDocuments(query);

        // Calculate total pages
        const totalPages = Math.ceil(totalResult / limit);

        const spus = await spuModel
            .find(query)
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'product_category',
                select: 'category_name',
            })
            .lean()
            .exec();

        return ({
            products: spus,
            pagination: {
                totalResult,
                totalPages,
                currentPage: page,
            }
        })

    }

    static async findAllSpu({
        limit = 10,
        page = 1
    }) {
        console.log("🚀 ~ SpuService ~ page:", page)
        console.log("🚀 ~ SpuService ~ limit:", limit)
        const query = {};

        const skip = (page - 1) * limit;
        // Get total count of matching documents
        const totalResult = await spuModel.countDocuments(query);

        // Calculate total pages
        const totalPages = Math.ceil(totalResult / limit);

        const spus = await spuModel
            .find(query)
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'product_category',
                select: 'category_name',
            })
            .lean()
            .exec();

        return {
            products: spus,
            pagination: {
                totalResult,
                totalPages,
                currentPage: page,
            }
        }
    }

    static updateStockSPU = async (spuId, quantity, mongoSession = null) => {
        try {
            if (quantity <= 0) {
                throw new Error('Số lượng cần giảm phải lớn hơn 0.');
            }

            const result = await spuModel.findOneAndUpdate({
                _id: spuId,
            }, {
                $inc: {
                    product_quantity: -quantity,
                    product_quantitySold: quantity
                }
            }, {
                session: mongoSession,
                new: true
            });


            if (!result) {
                throw new Error('Không đủ tồn kho hoặc sản phẩm không tồn tại.');
            }

            return {
                success: true,
                message: 'Tồn kho đã được cập nhật.',
                data: result,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    };


    // filter for client in search page
    static async findAllSpuWithCondition({
        product_status,
        stock_status,
        categorySlug,
        sortBy,
        minPrice,
        maxPrice,
        limit = 10,
        page = 1,
    }) {
        // Xây dựng query
        const category = await categoryModel.findOne({
            category_slug: categorySlug
        })
        if (!category) throw new BadRequestError("Không tìm thấy category")
        const categoryId = category._id;

        const query = await buildQueryForClient({
            product_status,
            stock_status,
            minPrice,
            maxPrice,
        });

        const skip = (page - 1) * limit;

        const queryLast = {
            ...query,
            isPublished: true,
            isDraft: false,
            ...(categoryId && {
                product_category: {
                    $in: [categoryId],
                },
            }),
        };

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
            case 'newest':
                sortOptions.createdAt = -1;
                break;
            default:
                sortOptions.createdAt = -1;
        }


        // Thực hiện truy vấn
        return await querySpu({
            query: queryLast,
            sort: sortOptions,
            limit,
            page,
            skip,
        });
    }

    static async getListProdcutDetailsForAdmin({
        spuIds
    }) {
        return await Promise.all(spuIds.map(async (spuId) => {
            const foundSpu = await spuModel.findById(spuId).lean();

            if (!foundSpu) throw new BadRequestError('Spu not exists');

            const sku_list = await SkuService.allSkuBySpuForAdmin({
                product_id: spuId,
            });

            return {
                spu_info: _.omit(foundSpu, ['__v', 'isDeleted', 'updatedAt', 'createdAt']),
                sku_list: sku_list.map((sku) => _.omit(sku, ['__v', 'isDeleted', 'updatedAt', 'createdAt'])),
            };
        }))


        // filter for admin 
    }

    static async filterSpuForPromotion({
        startTime,
        endTime,
        product_name,
        categoryId,
        limit = 10,
        skip = 0,
    }) {
        const spuIds = await PromotionService.getSpuInPromotion({
            startTime,
            endTime
        });

        const filter = {
            _id: {
                $nin: spuIds
            },
        };

        if (product_name) {
            filter.product_name = {
                $regex: product_name,
                $options: 'i'
            };
        }

        if (categoryId) {
            filter.product_category = {
                $in: [categoryId]
            };
        }

        const spus = await spuModel.find(filter)
            .limit(limit)
            .skip(skip)
            .lean();

        return spus;
    }

}