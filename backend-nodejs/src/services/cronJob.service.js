import cron from 'node-cron';
import promotionModel from '../models/promotion.model.js';

cron.schedule('* * * * *', async () => {
    console.log('Cron job to activate promotions is running...');
    try {

        const now = new Date();
        const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);

        const expiredPromotions = await promotionModel.updateMany({
            endTime: {
                $lt: vietnamTime
            },
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
        const now = new Date();
        const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);

        const promotionsToActivate = await promotionModel.updateMany({
            startTime: {
                $lte: vietnamTime // So sánh với giờ Việt Nam
            },
            endTime: {
                $gt: vietnamTime
            },

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