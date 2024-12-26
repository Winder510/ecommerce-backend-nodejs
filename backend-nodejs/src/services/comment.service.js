import mongoose from 'mongoose';
import {
    TYPE_NOTIFICATION
} from '../constant/index.js';
import {
    BadRequestError,
    NotFoundError
} from '../core/error.response.js';
import commentModel from '../models/comment.model.js';
import {
    findProduct
} from '../models/repositories/product.repo.js';
import {
    sendNotifitoQueue
} from './rabbitmq.service.js';

/*
{
Key feature: + add comment [admin/user]
            + get list of comment [admin/user]
            + delete a comment [admin/user]
}
*/
export default class CommentService {
    static async createComment({
        productId,
        userId,
        content,
        rating,
        parentCommentId = null
    }) {
        const user = await userModel.findById(userId).populate('usr_role');
        const roleName = user.usr_role.rol_name;
        let isFromSystem = false;
        if (roleName !== 'user') {
            isFromSystem = true;
        }
        const comment = new commentModel({
            comment_productId: productId,
            comment_userId: userId,
            comment_content: content,
            comment_rating: rating,
            comment_parentId: parentCommentId,
            isFromSystem
        });

        let rightValue;

        if (parentCommentId) {
            // reply comment
            const parentComment = await commentModel.findById(parentCommentId);

            if (!parentComment) throw new NotFoundError('Not found parent comment');

            rightValue = parentComment.comment_right;

            // update many comment
            await commentModel.updateMany({
                comment_productId: productId,
                comment_right: {
                    $gte: rightValue,
                },
            }, {
                $inc: {
                    comment_right: 2,
                },
            }, );

            await commentModel.updateMany({
                comment_productId: productId,
                comment_left: {
                    $gt: rightValue,
                },
            }, {
                $inc: {
                    comment_left: 2,
                },
            }, );
        } else {
            const maxValueRight = await commentModel.findOne({
                    comment_productId: productId,
                },
                'comment_right', {
                    sort: {
                        comment_right: -1,
                    },
                },
            );

            if (maxValueRight) {
                rightValue = maxValueRight.comment_right + 1;
            } else {
                rightValue = 1;
            }
        }

        // insert to comment
        comment.comment_left = rightValue;
        comment.comment_right = rightValue + 1;

        await comment.save();

        // if(comment){
        //     sendNotifitoQueue("INDIVIDUAL",{
        //         type: TYPE_NOTIFICATION.
        //     })
        // }

        return comment;
    }

    static async getCommenByParentId({
        productId,
        parentCommentId = null,
        limit = 50,
        offset = 0
    }) {
        if (parentCommentId) {
            const parent = await commentModel.findById(parentCommentId);
            if (!parent) throw new NotFoundError('Not found parent comment');

            const comments = await commentModel
                .find({
                    comment_productId: productId,
                    comment_parentId: parentCommentId,
                    comment_left: {
                        $gt: parent.comment_left,
                    },
                    comment_right: {
                        $lt: parent.comment_right,
                    },
                }).populate({
                    path: 'comment_userId',
                    select: 'usr_avatar usr_name'
                })
                .sort({
                    comment_left: 1,
                }).skip(offset) // Bỏ qua `offset` comment đầu tiên
                .limit(limit); // Lấy `limit` comment tiếp theo;

            return comments;
        }

        const comments = await commentModel
            .find({
                comment_productId: productId,
                comment_parentId: parentCommentId,
            }).populate({
                path: 'comment_userId',
                select: 'usr_avatar usr_name'
            })
            .sort({
                createdAt: -1,
            }).skip(offset) // Bỏ qua `offset` comment đầu tiên
            .limit(limit); // Lấy `limit` comment tiếp theo;
        return comments;
    }

    static async deleteComments({
        commentId,
        productId
    }) {
        const foundProduct = await findProduct({
            product_id: productId,
            unSelect: [],
        });
        if (!foundProduct) throw new NotFoundError('Product not found');

        //xac dinh left va rights
        const comment = await commentModel.findById(commentId);

        const leftValue = comment.comment_left;
        const rightValue = comment.comment_right;

        const width = rightValue - leftValue + 1;

        // xoa tat ca comment con
        await commentModel.deleteMany({
            comment_productId: productId,
            comment_left: {
                $gte: leftValue,
            },
            comment_right: {
                $lte: rightValue,
            },
        });

        await commentModel.updateMany({
            comment_productId: productId,
            comment_right: {
                $gt: rightValue,
            },
        }, {
            $inc: {
                comment_right: -width,
            },
        }, );

        await commentModel.updateMany({
            comment_productId: productId,
            comment_left: {
                $gt: rightValue,
            },
        }, {
            $inc: {
                comment_left: -width,
            },
        }, );

        return true;
    }

    static async likeComment(req, commentId) {
        try {
            const userId = req.user.userId;

            // Kiểm tra comment tồn tại
            const comment = await commentModel.findById(commentId);
            if (!comment) throw BadRequestError('Comment is not exist\!')

            // Kiểm tra xem user đã like chưa
            const isLiked = comment.comment_user_likes.includes(userId);

            let updatedComment;
            if (isLiked) {
                // Nếu đã like thì remove like
                updatedComment = await commentModel.findByIdAndUpdate(
                    commentId, {
                        $pull: {
                            comment_user_likes: userId
                        },
                        $inc: {
                            comment_likes: -1
                        }
                    }, {
                        new: true
                    }
                );

                return {
                    liked: false,
                    likeCount: updatedComment.comment_likes
                }
            } else {
                // Nếu chưa like thì thêm like
                updatedComment = await commentModel.findByIdAndUpdate(
                    commentId, {
                        $addToSet: {
                            comment_user_likes: userId
                        },
                        $inc: {
                            comment_likes: 1
                        }
                    }, {
                        new: true
                    }
                );

                return {
                    liked: true,
                    likeCount: updatedComment.comment_likes
                }
            }
        } catch (error) {

        }
    };

    static checkCommentByPurchaser = async ({
        userId,
        productId
    }) => {
        const comment = await commentModel.findOne({
            comment_productId: productId,
            comment_userId: userId,
            comment_rating: {
                $gt: 0
            }
        });

        return !!comment;
    };

    static getRatingCounts = async ({
        productId
    }) => {
        try {
            const ratingCounts = await commentModel.aggregate([{
                    $match: {
                        comment_productId: new mongoose.Types.ObjectId(productId)
                    }
                },
                {
                    $group: {
                        _id: "$comment_rating",
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                }
            ]);
            return ratingCounts;
        } catch (error) {
            console.error("Error fetching rating counts:", error);
            throw error;
        }
    };

    static getTotalCommentsAndRatings = async ({
        productId
    }) => {
        try {
            // Lấy tổng số comment cho sản phẩm
            const totalComments = await commentModel.countDocuments({
                comment_productId: new mongoose.Types.ObjectId(productId),
            });

            // Lấy tổng số lượng comment có rating và phân theo rating
            const ratingCounts = await commentModel.aggregate([{
                    $match: {
                        comment_productId: new mongoose.Types.ObjectId(productId),
                        comment_rating: {
                            $gt: 0
                        } // Lọc chỉ những comment có rating > 0
                    }
                },
                {
                    $group: {
                        _id: "$comment_rating", // Nhóm theo rating
                        count: {
                            $sum: 1
                        } // Đếm số lượng comment theo rating
                    }
                },
                {
                    $sort: {
                        _id: 1 // Sắp xếp theo rating từ thấp đến cao
                    }
                }
            ]);

            return {
                totalComments, // Trả về tổng số comment
                ratingCounts // Trả về số lượng comment theo rating
            };
        } catch (error) {
            console.error("Error fetching total comments and ratings:", error);
            throw error;
        }
    };


}