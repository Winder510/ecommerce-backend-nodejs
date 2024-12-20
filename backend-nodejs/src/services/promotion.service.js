import promotionModel from "../models/promotion.model.js";
import {
    BadRequestError,
    NotFoundError
} from '../core/error.response.js'

import {
    getListAppliedSpu,
    isTimeSlotAvailable
} from '../models/repositories/promotion.repo.js'
class PromotionService {
    static async createNewPromotion({
        prom_name,
        prom_banner = '',
        appliedProduct,
        startTime,
        endTime,
    }) {
        const newPromotion = new promotionModel({
            prom_name,
            prom_banner,
            appliedProduct,
            startTime,
            endTime,
        });

        const savedPromotion = await newPromotion.save();
        return savedPromotion;
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

        const promotionOverLap = await isTimeSlotAvailable(startTime, endTime);

        if (promotionOverLap) {
            return await getListAppliedSpu(promotionOverLap._id)
        }

        return [];
    }

    static async createNewFlashSale({
        prom_name,
        prom_banner = '',
        event_type = 'Flash sale',
        appliedProduct,
        startTime,
        endTime,
    }) {
        const newPromotion = new promotionModel({
            prom_name,
            prom_banner,
            appliedProduct,
            startTime,
            endTime,
            event_type
        });

        const savedPromotion = await newPromotion.save();
        return savedPromotion;
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
            event_type: 'Flash sale'
        })
    }

    static async getFlashSaleNearest() {
        // Lấy thời gian hiện tại
        const now = new Date();

        // Tìm chương trình Flash Sale gần nhất
        const flashSaleEvent = await promotionModel
            .findOne({
                eventType: "Flash sale", // Chỉ lấy các sự kiện dạng Flash Sale
                status: "active", // Sự kiện đang hoạt động
                disable: false, // Sự kiện chưa bị vô hiệu hóa
                startTime: {
                    $lte: now
                }, // Đã bắt đầu
                endTime: {
                    $gte: now
                } // Chưa kết thúc
            })
            .sort({
                startTime: 1
            }) // Sắp xếp theo thời gian bắt đầu
            .lean();

        // Nếu không có sự kiện nào, trả về null
        if (!flashSaleEvent) {
            return null;
        }

        // Lấy danh sách các sản phẩm trong Flash Sale
        const appliedProducts = flashSaleEvent.appliedProduct;

        // Duyệt qua từng sản phẩm và tính giá sau giảm
        const productDetails = await Promise.all(
            appliedProducts.map(async (product) => {
                const spu = await spuModel.findById(product.spuId).lean();
                if (!spu) return null;

                // Duyệt qua danh sách SKU liên quan
                const skuDetails = await Promise.all(
                    product.sku_list.map(async (skuPromotion) => {
                        const sku = await skuModel.findById(skuPromotion.skuId).lean();
                        if (!sku) return null;

                        // Tính giá giảm
                        let discountValue = 0;
                        if (skuPromotion.discountType === "PERCENTAGE") {
                            discountValue = sku.sku_price * (skuPromotion.discountValue / 100);
                            if (skuPromotion.maxDiscountValue) {
                                discountValue = Math.min(discountValue, skuPromotion.maxDiscountValue);
                            }
                        } else if (skuPromotion.discountType === "FIXED") {
                            discountValue = skuPromotion.discountValue;
                        }

                        const priceAfterDiscount = Math.max(sku.sku_price - discountValue, 0);

                        return {
                            skuId: sku._id,
                            originalPrice: sku.sku_price,
                            discountValue,
                            priceAfterDiscount
                        };
                    })
                );

                // Loại bỏ các SKU không hợp lệ
                const validSkuDetails = skuDetails.filter((sku) => sku !== null);

                return {
                    spuId: spu._id,
                    spuName: spu.product_name,
                    originalPrice: spu.product_price,
                    skuDetails: validSkuDetails
                };
            })
        );

        // Loại bỏ các sản phẩm không hợp lệ
        const validProducts = productDetails.filter((product) => product !== null);

        // Trả về thông tin Flash Sale
        return {
            eventId: flashSaleEvent._id,
            eventName: flashSaleEvent.prom_name,
            banner: flashSaleEvent.prom_banner,
            startTime: flashSaleEvent.startTime,
            endTime: flashSaleEvent.endTime,
            products: validProducts
        };
    }

}
export default PromotionService;