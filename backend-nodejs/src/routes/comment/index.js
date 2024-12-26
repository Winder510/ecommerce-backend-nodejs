import express from 'express';

import {
    asyncErrorHandler
} from '../../helpers/asyncHandler.js';
import commentController from '../../controllers/comment.controller.js';
import {
    authenticationV2
} from '../../auth/authUtils.js';

const router = express.Router();
router.get('', asyncErrorHandler(commentController.getListComment));
router.post('/check-has-purchased', asyncErrorHandler(commentController.checkCommentByPurchaser));
router.get('/rating-count/:productId', asyncErrorHandler(commentController.getRatingCounts));
router.get('/total-rating-comment/:productId', asyncErrorHandler(commentController.getTotalCommentsAndRatings));

router.use(authenticationV2);
router.post('', asyncErrorHandler(commentController.createComment));
router.delete('', asyncErrorHandler(commentController.deleteComments));
router.put('/:commentId/like', asyncErrorHandler(commentController.likeComment));
router.get("/with-rating/:productId", asyncErrorHandler(commentController.getReviewProductById))
export default router;