// !dmbg
import {
    required
} from 'joi';
import mongoose, {
    Schema
} from 'mongoose';
const COLLECTION_NAME = "Promotions"
const DOCUMENT_NAME = "Promotion"

var promotionSchema = new mongoose.Schema({
    pro_name: {
        type: String,
        required: true
    },
    pro_type: {
        type: String,
        enum: ["included", "extra", "bundle"], // Các loại khuyến mãi
        required: true
    },
    pro_urlImage: {
        type: String,
        required: true
    },
    pro_urlPage: {
        type: String,
        required: true
    },
    pro_discountPrice: {
        type: Number,
        required: true,
        min: 0 // Giá giảm không được âm
    },
    pro_appliedProduct: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product" // Liên kết tới sản phẩm được áp dụng
    }],
    pro_startDate: {
        type: Date,
        required: true
    },
    pro_endDate: {
        type: Date,
        required: true
    },
    pro_bundle_product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        default: null // Sản phẩm tặng kèm
    },
    pro_quantity_limit: {
        type: Number,
        default: 1, // Giới hạn số lượng sản phẩm tặng kèm
        min: 0
    },
    pro_status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active" // Trạng thái khuyến mãi
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
export default mongoose.model(DOCUMENT_NAME, promotionSchema);