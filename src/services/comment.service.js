import {
    BadRequestError,
    NotFoundError
} from "../core/error.response.js";
import commentModel from "../models/comment.model.js";
import {
    findProduct
} from "../models/repositories/product.repo.js";

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
        parentCommentId = null
    }) {
        const comment = new commentModel({
            comment_productId: productId,
            comment_userId: userId,
            comment_content: content,
            comment_parentId: parentCommentId
        })

        let rightValue;

        if (parentCommentId) {
            // reply comment 
            const parentComment = await commentModel.findById(parentCommentId)

            if (!parentComment) throw new NotFoundError("Not found parent comment")

            rightValue = parentComment.comment_right;

            // update many comment 
            await commentModel.updateMany({
                comment_productId: productId,
                comment_right: {
                    $gte: rightValue
                }
            }, {
                $inc: {
                    comment_right: 2
                }
            })

            await commentModel.updateMany({
                comment_productId: productId,
                comment_left: {
                    $gt: rightValue
                }
            }, {
                $inc: {
                    comment_left: 2
                }
            })
        } else {
            const maxValueRight = await commentModel.findOne({
                comment_productId: productId
            }, 'comment_right', {
                sort: {
                    comment_right: -1
                }
            })

            if (maxValueRight) {
                rightValue = maxValueRight.comment_right + 1;
            } else {
                rightValue = 1;
            }
        }

        // insert to comment 
        comment.comment_left = rightValue;
        comment.comment_right = rightValue + 1


        await comment.save()
        return comment
    }
    static async getCommenByParentId({
        productId,
        parentCommentId = null,
        limit = 50,
        offset = 0
    }) {
        if (parentCommentId) {
            const parent = await commentModel.findById(parentCommentId)
            if (!parent) throw new NotFoundError("Not found parent comment")

            const comments = await commentModel.find({
                comment_productId: productId,
                comment_left: {
                    $gt: parent.comment_left
                },
                comment_right: {
                    $lt: parent.comment_right
                }
            }).select({
                comment_left: 1,
                comment_right: 1,
                comment_content: 1,
                comment_parentId: 1
            }).sort({
                comment_left: 1
            })
            return comments

        }

        const comments = await commentModel.find({
            comment_productId: productId,
            comment_parentId: parentCommentId
        }).select({
            comment_left: 1,
            comment_right: 1,
            comment_content: 1,
            comment_parentId: 1
        }).sort({
            comment_left: 1
        })
        return comments
    }

    static async deleteComments({
        commentId,
        productId
    }) {
        const foundProduct = await findProduct({
            product_id: productId,
            unSelect: []
        })
        if (!foundProduct) throw new NotFoundError("Product not found")

        //xac dinh left va rights
        const comment = await commentModel.findById(commentId)

        const leftValue = comment.comment_left;
        const rightValue = comment.comment_right

        const width = rightValue - leftValue + 1;

        // xoa tat ca comment con 
        await commentModel.deleteMany({
            comment_productId: productId,
            comment_left: {
                $gte: leftValue,
            },
            comment_right: {
                $lte: rightValue
            }
        });

        await commentModel.updateMany({
            comment_productId: productId,
            comment_right: {
                $gt: rightValue
            }
        }, {
            $inc: {
                comment_right: -width
            }
        })

        await commentModel.updateMany({
            comment_productId: productId,
            comment_left: {
                $gt: rightValue
            },
        }, {
            $inc: {
                comment_left: -width
            }
        })

        return true
    }
}