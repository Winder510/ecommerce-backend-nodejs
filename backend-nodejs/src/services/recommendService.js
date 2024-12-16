import recommendModel from "../models/recommend.model";

class RecommendService {
    static async smartRecommendationTracking(userId, productId, interactionType) {
        // Kiểm tra recommendation đã tồn tại chưa
        const existingRecommendation = await recommendModel.findOne({
            rec_userId: userId,
            rec_viewedProduct: productId,
            rec_interactionType: interactionType
        });

        if (!existingRecommendation) {
            await recommendModel.create({
                rec_userId: userId,
                rec_viewedProduct: productId,
                rec_interactionType: interactionType,
                rec_confidence: calculateConfidence(interactionType)
            });
        } else {
            // Cập nhật timestamp nếu muốn
            existingRecommendation.updatedAt = new Date();
            await existingRecommendation.save();
        }
    }

    calculateConfidence(interactionType) {
        switch (interactionType) {
            case 'purchase':
                return 1.0;
            case 'cart':
                return 0.7;
            case 'wishlist':
                return 0.5;
            case 'view':
                return 0.3;
            default:
                return 0.1;
        }
    }
}