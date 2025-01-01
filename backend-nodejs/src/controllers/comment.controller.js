import {
    SuccessResponse
} from '../core/success.response.js';
import commentService from '../services/comment.service.js';

class CommentController {
    createComment = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create new comment success',
            metadata: await commentService.createComment({
                ...req.body,
            }),
        }).send(res);
    };

    getListComment = async (req, res, next) => {
        new SuccessResponse({
            message: 'get list comment success ',
            metadata: await commentService.getCommenByParentId({
                ...req.query,
            }),
        }).send(res);
    };

    deleteComments = async (req, res, next) => {
        new SuccessResponse({
            message: 'delete comment success',
            metadata: await commentService.deleteComments({
                ...req.body,
            }),
        }).send(res);
    };

    likeComment = async (req, res, next) => {
        const {
            commentId
        } = req.params;
        console.log("🚀 ~ CommentController ~ likeComment= ~ commentId:", commentId)
        new SuccessResponse({
            message: 'like comment success',
            metadata: await commentService.likeComment(req, commentId),
        }).send(res);
    };

    checkCommentByPurchaser = async (req, res, next) => {
        new SuccessResponse({
            message: 'like comment success',
            metadata: await commentService.checkCommentByPurchaser({
                ...req.body
            }),
        }).send(res);
    };

    getRatingCounts = async (req, res, next) => {
        new SuccessResponse({
            message: 'get rating conut',
            metadata: await commentService.getRatingCounts({
                ...req.params
            }),
        }).send(res);
    };

    getTotalCommentsAndRatings = async (req, res, next) => {
        new SuccessResponse({
            message: 'get rating conut',
            metadata: await commentService.getTotalCommentsAndRatings({
                ...req.params
            }),
        }).send(res);
    };

    getReviewProductById = async (req, res, next) => {
        new SuccessResponse({
            message: 'get ',
            metadata: await commentService.getReviewProductById({
                ...req.params
            }),
        }).send(res);
    };
    test = async (req, res, next) => {
        new SuccessResponse({
            message: 'get ',
            metadata: await commentService.test(),
        }).send(res);
    };

}
export default new CommentController();