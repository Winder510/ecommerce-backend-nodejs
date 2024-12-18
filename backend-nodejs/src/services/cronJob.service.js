import cron from 'node-cron';
import promotionModel from '../models/promotion.model.js';

cron.schedule('* * * * *', async () => {
    const now = new Date();

    const expiredPromotions = await promotionModel.updateMany({
        endTime: {
            $lt: now
        },
        status: 'active'
    }, {
        status: 'inactive'
    });

    if (expiredPromotions.modifiedCount > 0) {
        console.log(`Updated ${expiredPromotions.modifiedCount} expired Flash Sales to inactive`);
    }
});

cron.schedule('* * * * *', async () => {
    const now = new Date();

    const promotionsToActivate = await promotionModel.updateMany({
        startTime: {
            $lte: now
        },
        status: 'inactive'
    }, {
        status: 'active'
    });

    if (promotionsToActivate.modifiedCount > 0) {
        console.log(`Activated ${promotionsToActivate.modifiedCount} promotions`);
    }
});