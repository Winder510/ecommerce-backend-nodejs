import promotionModel from "../models/promotion.model.js";
import {
    BadRequestError,
    NotFoundError
} from '../core/error.response.js'

import {
    getListAppliedSpu,
    getTotalQuantityAppliedAndLimit,
    isTimeSlotAvailable
} from '../models/repositories/promotion.repo.js'
import {
    getPriceSpu
} from "../models/repositories/spu.repo.js";
import spuModel from "../models/spu.model.js";
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
        eventType
    }) {
        const currentTime = new Date(); // Thời gian hiện tại theo UTC
        const vietnamTimezoneOffset = 7 * 60 * 60 * 1000; // Múi giờ Việt Nam: +7 tiếng

        const promotions = await promotionModel.find({
            eventType
        });
        const modifiedPromotions = promotions.map((promotion) => {
            const {
                appliedProduct,
                startTime,
                endTime,
                ...rest
            } = promotion.toObject(); // Loại bỏ trường appliedProduct

            const startDate = new Date(new Date(startTime).getTime() + vietnamTimezoneOffset); // Chuyển startTime sang giờ VN
            const endDate = new Date(new Date(endTime).getTime() + vietnamTimezoneOffset); // Chuyển endTime sang giờ VN
            const vietnamCurrentTime = new Date(currentTime.getTime() + vietnamTimezoneOffset); // Thời gian hiện tại theo giờ VN

            // Xác định trạng thái của promotion
            let status = "Sắp diễn ra"; // Mặc định là "sắp diễn ra"
            if (vietnamCurrentTime >= startDate && vietnamCurrentTime <= endDate) {
                status = "Đang diễn ra"; // Đang diễn ra
            } else if (vietnamCurrentTime > endDate) {
                status = "Đã kết thúc "; // Đã kết thúc
            }

            return {
                ...rest,
                startTime: startDate.toISOString(), // Định dạng lại thời gian theo ISO
                endTime: endDate.toISOString(),
                appliedProductLength: appliedProduct.length, // Tính độ dài của appliedProduct
                status,
            };
        });

        return modifiedPromotions;
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

            console.log("🚀 ~ PromotionService ~ spuswithPrice ~ spuswithPrice:", spuswithPrice)
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



}
export default PromotionService;