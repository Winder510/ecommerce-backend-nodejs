import promotionModel from "../models/promotion.model.js";
import {
    BadRequestError,
    NotFoundError
} from '../core/error.response.js'

import {
    getListAppliedSpu,
    getTotalQuantityAppliedAndLimit,
    getTotalQuantityAppliedAndLimitV2,
    isTimeSlotAvailable
} from '../models/repositories/promotion.repo.js'
import {
    getPriceSpu
} from "../models/repositories/spu.repo.js";
import spuModel from "../models/spu.model.js";
import {
    model
} from "mongoose";
import skuModel from "../models/sku.model.js";
class PromotionService {
    static async createNewPromotion({
        prom_name,
        prom_banner = '',
        eventType = '',
        appliedProduct,
        startTime,
        endTime,
    }) {
        if (eventType === "Flash sale") {
            const check = isTimeSlotAvailable(startTime, endTime)
            if (!check) {
                throw BadRequestError("Lỗi: Trùng thời gian flash sale")
            }
        }

        const newPromotion = new promotionModel({
            prom_name,
            prom_banner,
            appliedProduct,
            startTime,
            endTime,
            eventType
        });

        const savedPromotion = await newPromotion.save();
        return savedPromotion;
    }

    static async updatePromotion({
        promId,
        prom_name,
        prom_banner = '',
        eventType = '',
        appliedProduct,
        startTime,
        endTime,
    }) {
        const updatedPromotion = await promotionModel.findByIdAndUpdate(
            promId, {
                prom_name,
                prom_banner,
                eventType,
                appliedProduct,
                startTime,
                endTime,
            }, {
                new: true
            } // Trả về bản ghi sau khi cập nhật
        );

        return updatedPromotion;
    }

    static async getListPromotions({
        eventType,
        status,
        dateRange = [null, null],
        page = 1,
        limit = 10
    }) {
        const currentTime = new Date();
        const vietnamTimezoneOffset = 7 * 60 * 60 * 1000;
        const vietnamCurrentTime = new Date(currentTime.getTime() + vietnamTimezoneOffset);

        // Tính toán skip cho phân trang
        const skip = (page - 1) * limit;

        // Xây dựng query filter
        const queryFilter = {
            eventType
        };

        // Thêm điều kiện filter theo date range nếu có
        const [startDate, endDate] = dateRange;
        if (startDate && endDate) {
            queryFilter.$or = [
                // Sự kiện bắt đầu trong khoảng thời gian
                {
                    startTime: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                },
                // Sự kiện kết thúc trong khoảng thời gian
                {
                    endTime: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                },
                // Sự kiện bao trùm khoảng thời gian
                {
                    $and: [{
                            startTime: {
                                $lte: new Date(startDate)
                            }
                        },
                        {
                            endTime: {
                                $gte: new Date(endDate)
                            }
                        }
                    ]
                }
            ];
        }

        // Lấy tất cả promotions theo filter
        const allPromotions = await promotionModel.find(queryFilter).sort({
            createdAt: -1
        });

        // Xử lý và tính toán status cho tất cả promotions
        const processedPromotions = allPromotions.map(promotion => {
            const {
                appliedProduct,
                startTime,
                endTime,
                ...rest
            } = promotion.toObject();

            let computedStatus = "Sắp diễn ra";
            if (vietnamCurrentTime >= startTime && vietnamCurrentTime <= endTime) {
                computedStatus = "Đang diễn ra";
            } else if (vietnamCurrentTime > endTime) {
                computedStatus = "Đã kết thúc";
            }

            return {
                ...rest,
                startTime,
                endTime,
                appliedProductLength: appliedProduct.length,
                status: computedStatus,
            };
        });

        // Lọc theo status nếu có
        const filteredPromotions = status ?
            processedPromotions.filter(promotion => promotion.status === status) :
            processedPromotions;

        // Áp dụng phân trang cho kết quả đã lọc
        const paginatedPromotions = filteredPromotions.slice(skip, skip + limit);

        // Tính toán thông tin phân trang dựa trên số lượng sau khi lọc
        const totalFilteredPromotions = filteredPromotions.length;

        return {
            promotions: paginatedPromotions,
            pagination: {
                total: totalFilteredPromotions,
                totalPages: Math.ceil(totalFilteredPromotions / limit),
                currentPage: page,
                limit
            }
        };
    }


    static async toggleUpdateDisable(id) {
        const promotion = await promotionModel.findById(id);

        if (!promotion) {
            throw new Error("Promotion not found");
        }

        promotion.disable = !promotion.disable;

        // Lưu lại thay đổi
        await promotion.save();

        return {
            message: `Promotion is now ${promotion.disable ? "disabled" : "enabled"}`,
            updatedPromotion: promotion,
        };
    }


    static async getOnePromotion(id) {
        return await promotionModel.findById(id);
    }

    static async deletePromotion(promotionId) {

        const deletedPromotion = await promotionModel.findByIdAndDelete(promotionId);

        if (!deletedPromotion) {
            throw new NotFoundError('Promotion not found');
        }

        return deletedPromotion;

    }

    static async getSpuInPromotion({
        startTime,
        endTime
    }) {

        const promotionOverLaps = await isTimeSlotAvailable(startTime, endTime);

        if (promotionOverLaps) {
            return await getListAppliedSpu(promotionOverLaps)
        }

        return [];
    }

    static async deleteFlashSale(promotionId) {
        const deletedPromotion = await promotionModel.findByIdAndDelete(promotionId);

        if (!deletedPromotion) {
            throw new NotFoundError('Promotion not found');
        }

        return deletedPromotion;

    }

    static async getListFlashSale() {
        return await promotionModel.find({
            eventType: 'Flash sale'
        })
    }

    static getActiveFlashSale = async () => {
        try {
            const currentTime = new Date();
            currentTime.setHours(currentTime.getHours() + 7); // Thêm 7 giờ để chuyển sang múi giờ VN (UTC+7)
            const activePromotions = await promotionModel.find({
                status: 'active',
                disable: false,
                eventType: 'Flash sale',
                startTime: {
                    $lte: currentTime
                },
                endTime: {
                    $gte: currentTime
                },
            }).lean();

            if (activePromotions.length > 0) {
                const spus = await this.getSpuFormPromotion(activePromotions[0].appliedProduct);
                return {
                    ...activePromotions[0],
                    appliedProduct: spus
                };
            }

            const oneDayLater = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);

            const closestPromotion = await promotionModel.find({
                    disable: false,
                    eventType: 'Flash sale',
                    startTime: {
                        $gte: currentTime, // Thời gian bắt đầu phải từ hiện tại trở đi
                        $lte: oneDayLater, // Thời gian bắt đầu không vượt quá 1 ngày
                    }
                })
                .sort({
                    startTime: 1
                })
                .limit(1)
                .lean();

            if (closestPromotion.length > 0) {
                const spus = await this.getSpuFormPromotion(closestPromotion[0].appliedProduct);
                return {
                    ...closestPromotion[0],
                    appliedProduct: spus
                };
            }

            throw new NotFoundError("Not find any Flash sale");
        } catch (error) {
            console.error('Error fetching promotion:', error);
            throw error;
        }
    };

    // static updateAppliedQuantity = async (promotionId, skuId, quantityPurchased) => {
    //     // Tìm chương trình khuyến mãi có promotionId
    //     const promotion = await promotionModel.findById(promotionId);
    //     if (!promotion) {
    //         throw new BadRequestError("Promotion not found");
    //     }

    //     // Tìm chương trình khuyến mãi có skuId trong danh sách 'appliedProduct'
    //     let appliedProduct = null;
    //     for (const product of promotion.appliedProduct) {
    //         appliedProduct = product.sku_list.find(sku => sku.skuId.toString() === skuId.toString());
    //         if (appliedProduct) {
    //             break;
    //         }
    //     }

    //     if (!appliedProduct) {
    //         throw new BadRequestError("SKU not found in the promotion");
    //     }

    //     // Kiểm tra số lượng đã áp dụng và giới hạn số lượng giảm giá
    //     const {
    //         appliedQuantity,
    //         quantityLimit
    //     } = appliedProduct;
    //     if (appliedQuantity + quantityPurchased > quantityLimit) {
    //         throw new BadRequestError("Exceeded quantity limit for the promotion");
    //     }

    //     // Cập nhật số lượng đã áp dụng
    //     appliedProduct.appliedQuantity += quantityPurchased;

    //     // Cập nhật lại chương trình khuyến mãi trong cơ sở dữ liệu
    //     await promotion.save();

    //     return {
    //         message: "Applied quantity updated successfully",
    //         appliedQuantity: appliedProduct.appliedQuantity,
    //         quantityLimit: appliedProduct.quantityLimit,
    //     };
    // };

    static getSpuFormPromotion = async (appliedProducts) => {
        if (!appliedProducts || appliedProducts.length === 0) {
            throw new BadRequestError("No applied products found");
        }

        const spuIds = appliedProducts.map(product => product.spuId);

        const spus = await spuModel.find({
            _id: {
                $in: spuIds
            }
        }).lean();

        if (!spus || spus.length === 0) {
            throw new BadRequestError("No SPUs found for the provided promotion");
        }

        const {
            totalQuantityLimit,
            totalAppliedQuantity
        } = await getTotalQuantityAppliedAndLimit(appliedProducts)

        const spuswithPrice = await Promise.all(spus.map(async spu => {
            const {
                totalQuantityLimit,
                totalAppliedQuantity
            } = await getTotalQuantityAppliedAndLimitV2(spu._id, appliedProducts)

            return {
                ...spu,
                product_price: await getPriceSpu(spu._id),
                totalQuantityLimit,
                totalAppliedQuantity
            }
        }));

        return spuswithPrice;
    };

    static findOnePromotion({
        promotionId
    }) {
        return promotionModel.findById(promotionId).lean();
    }

    static updateAppliedQuantity = async ({
        promotionId,
        spuId,
        skuId,
        quantity
    }) => {
        try {
            if (promotionId === null) return;
            const result = await promotionModel.findOneAndUpdate({
                _id: promotionId
            }, {
                $inc: {
                    'appliedProduct.$[spu].sku_list.$[sku].appliedQuantity': quantity
                },
            }, {
                arrayFilters: [{
                        'spu.spuId': spuId
                    },
                    {
                        'sku.skuId': skuId
                    },
                ],
                new: true,
            });


            if (!result) {
                throw new Error('Không tìm thấy SPU hoặc SKU tương ứng trong khuyến mãi.');
            }

            return {
                success: true,
                message: 'Số lượng đã bán được cập nhật thành công.',
                data: result,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    };


    static getOnePromotionEvent = async () => {
        try {
            const currentTime = new Date();
            currentTime.setHours(currentTime.getHours() + 7);
            const promotionEvent = await promotionModel
                .findOne({
                    eventType: "Custom",
                    disable: false,
                    startTime: {
                        $lte: currentTime
                    },
                    endTime: {
                        $gte: currentTime
                    },
                })
                .sort({
                    createdAt: -1,
                })
                .lean();

            if (!promotionEvent) {
                throw new NotFoundError("Không tìm thấy sự kiện khuyến mãi phù hợp.");
            }

            const spuIds = promotionEvent.appliedProduct.map(product => product.spuId);

            const spus = await spuModel.find({
                _id: {
                    $in: spuIds
                }
            }).lean();

            if (!spus || spus.length === 0) {
                throw new BadRequestError("No SPUs found for the provided promotion");
            }

            const spuswithPrice = await Promise.all(spus.map(async spu => {
                return {
                    ...spu,
                    product_price: await getPriceSpu(spu._id),
                }
            }));

            return {
                ...promotionEvent,
                appliedProduct: spuswithPrice
            };


        } catch (error) {
            throw new Error(`Lỗi khi lấy sự kiện khuyến mãi: ${error.message}`);
        }
    };

    static getPromotionEventList = async ({
        eventType = "Custom"
    }) => {
        try {
            const currentTime = new Date();
            currentTime.setHours(currentTime.getHours() + 7);
            const promotionEvents = await promotionModel
                .find({
                    eventType: eventType,
                    disable: false,
                    startTime: {
                        $lte: currentTime
                    },
                    endTime: {
                        $gte: currentTime
                    },
                })
                .sort({
                    createdAt: -1,
                })
                .lean();
            return promotionEvents
        } catch (error) {
            throw new Error(`Lỗi khi lấy danh sách sự kiện khuyến mãi: ${error.message}`);
        }
    };

    static getOnePromotionEventById = async ({
        promotionId
    }) => {
        try {
            const currentTime = new Date();
            currentTime.setHours(currentTime.getHours() + 7);
            const promotionEvent = await promotionModel.findById(promotionId).lean();

            if (!promotionEvent) {
                throw new NotFoundError("Không tìm thấy sự kiện khuyến mãi phù hợp.");
            }

            const spuIds = promotionEvent.appliedProduct.map(product => product.spuId);

            const spus = await spuModel.find({
                _id: {
                    $in: spuIds
                }
            }).lean();

            if (!spus || spus.length === 0) {
                throw new BadRequestError("No SPUs found for the provided promotion");
            }

            const spuswithPrice = await Promise.all(spus.map(async spu => {
                return {
                    ...spu,
                    product_price: await getPriceSpu(spu._id),
                }
            }));

            return {
                ...promotionEvent,
                appliedProduct: spuswithPrice
            };


        } catch (error) {
            throw new Error(`Lỗi khi lấy sự kiện khuyến mãi: ${error.message}`);
        }
    };

    static calculateRevenueAndDetails = async (promotionId) => {
        const productDetails = [];
        let totalRevenueAllSpus = 0; // Khởi tạo biến tổng doanh thu của tất cả các SPU
        const promotion = await promotionModel.findById(promotionId).lean();

        // Duyệt qua từng appliedProduct (SPU)
        for (const appliedProduct of promotion.appliedProduct) {
            const spuId = appliedProduct.spuId;
            const spu = await spuModel.findById(spuId);
            const spuName = spu.product_name; // Tên SPU
            const spuThumb = spu.product_thumb;

            // Duyệt qua từng SKU trong mỗi appliedProduct
            const skus = [];
            let totalRevenue = 0; // Khởi tạo biến tổng doanh thu cho mỗi SPU

            for (const sku of appliedProduct.sku_list) {
                const skuId = sku.skuId;
                const skuFound = await skuModel.findById(skuId);

                const skuName = skuFound.sku_name; // Tên SKU
                const price = skuFound.sku_price; // Giá của SKU
                const discountType = sku.discountType; // Kiểu giảm giá (PERCENTAGE/FIXED)
                const discountValue = sku.discountValue; // Giá trị giảm giá
                const appliedQuantity = sku.appliedQuantity; // Số lượng đã bán
                const quantityLimit = sku.quantityLimit

                let discountedPrice = price;
                if (discountType === "PERCENTAGE") {
                    discountedPrice = price * (1 - discountValue / 100);
                } else if (discountType === "FIXED") {
                    discountedPrice = price - discountValue;
                }

                const revenue = discountedPrice * appliedQuantity;
                totalRevenue += revenue; // Cộng dồn doanh thu của SKU vào tổng doanh thu của SPU

                skus.push({
                    skuId: skuId,
                    skuName: skuName,
                    price: price,
                    appliedQuantity: appliedQuantity,
                    revenue: revenue,
                    discountType: discountType,
                    discountValue: discountValue,
                    discountedPrice: discountedPrice,
                    quantityLimit
                });
            }

            productDetails.push({
                spuName: spuName,
                spuThumb: spuThumb,
                skus: skus,
                totalRevenue: totalRevenue // Thêm tổng doanh thu của SPU vào
            });

            totalRevenueAllSpus += totalRevenue;
        }

        return {
            productDetails: productDetails,
            totalRevenueAllSpus: totalRevenueAllSpus // Tổng doanh thu của tất cả SPU
        };
    };





}
export default PromotionService;