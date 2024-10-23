import Joi from 'joi';
import mongoose from 'mongoose';

export class AddToCartDto {
    constructor(data) {
        this.userId = data.userId;
        this.product = data.product; // Product object
    }

    static getSchema() {
        return Joi.object({
            userId: Joi.string()
                .custom((value, helper) => {
                    if (!mongoose.Types.ObjectId.isValid(value)) {
                        return helper.message('Invalid user ID format');
                    }
                    return value;
                })
                .required(),
            product: Joi.object({
                productId: Joi.string()
                    .custom((value, helper) => {
                        if (!mongoose.Types.ObjectId.isValid(value)) {
                            return helper.message('Invalid product ID format');
                        }
                        return value;
                    })
                    .required(),
                quantity: Joi.number().integer().min(1).required(),
                // name: Joi.string().optional(),
                // price: Joi.number().precision(2).positive().required(),
            }).required(),
        });
    }

    static validate(data) {
        const schema = this.getSchema();
        const { error, value } = schema.validate(data);
        if (error) {
            throw new Error(error.details.map((err) => err.message).join(', '));
        }
        return value;
    }
}
