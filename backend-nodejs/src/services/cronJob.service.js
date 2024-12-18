import cron from 'node-cron';
import promotionModel from '../models/promotion.model.js';

cron.schedule('* * * * *', async () => {
    console.log('Cron job to activate promotions is running...');
    try {
        // Lấy giờ Việt Nam
        const now = new Date(); // Lấy thời gian hiện tại theo UTC
        const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000); // Chuyển sang GMT+7

        // Cập nhật các promotion đã hết hạn
        const expiredPromotions = await promotionModel.updateMany({
            endTime: {
                $lt: vietnamTime
            },
            status: 'active'
        }, {
            status: 'inactive'
        });

        if (expiredPromotions.modifiedCount > 0) {
            console.log(`Updated ${expiredPromotions.modifiedCount} expired Flash Sales to inactive`);
        }
    } catch (error) {
        console.error('Error in activating promotions:', error);
    }
});

cron.schedule('* * * * *', async () => {
    console.log('Cron job to deactivate expired promotions is running...');
    try {
        // Lấy giờ Việt Nam
        const now = new Date(); // Lấy thời gian hiện tại theo UTC
        const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000); // Chuyển sang GMT+7

        // Kích hoạt các promotion
        const promotionsToActivate = await promotionModel.updateMany({
            startTime: {
                $lte: vietnamTime // So sánh với giờ Việt Nam
            },
            status: 'inactive',
            disable: false
        }, {
            status: 'active'
        });


        if (promotionsToActivate.modifiedCount > 0) {
            console.log(`Activated ${promotionsToActivate.modifiedCount} promotions`);
        }
    } catch (error) {
        console.error('Error in deactivating expired promotions:', error);
    }
});