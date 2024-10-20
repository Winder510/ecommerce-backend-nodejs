import mongoose, {
    Schema
} from 'mongoose'; // Erase if already required
import slugify from 'slugify';
import {
    STOCK_STATUS
} from '../constant/index.js';

const COLLECTION_NAME = "Spus"
const DOCUMENT_NAME = "Spu"

const productSchema = new Schema({
    product_name: {
        type: String,
        required: true
    },
    product_thumb: {
        type: String,
        required: true
    },
    product_slug: {
        type: String,
    },
    product_description: {
        type: String,
    },
    product_price: {
        type: Number,
        required: true
    },
    product_discount_price: {
        type: Number,
    },
    product_quantity: {
        type: Number,
        required: true
    },
    product_stockStatus: {
        type: String,
    },
    product_category: {
        type: Array,
        default: []
    },
    product_attributes: {
        type: Schema.Types.Mixed,
        required: true
    },
    product_quantitySold: {
        type: Number,
        default: 0
    },
    product_revenue: {
        type: Number,
        default: 0
    },
    product_ratingAverage: {
        type: Number,
        default: 4.5,
        min: [1, "Rating must above 1.0"],
        max: [5, "Rating must below 5.0"],
        set: (val) => Math.round(val * 10) / 10
    },
    product_variations: {
        type: Array,
        default: []
        /*
            variations:[
                {
                    images: ,
                    name: color ,
                    options: [red,blue]
                },
                {
                    images: ,
                    name: size ,
                    options: [XL,S]
                }
            ]
        */
    },

    isDraft: {
        type: Boolean,
        default: true,
        index: true,
        select: false
    },
    isPublished: {
        type: Boolean,
        default: false,
        index: true,
        select: false
    },
    isDeleted: {
        type: Boolean,
        default: false,
    }

}, {
    collection: COLLECTION_NAME,
    timestamps: true
})
const updateStockStatus = function (quantity) {
    if (quantity === 0) {
        return STOCK_STATUS.OUT_OF_STOCK;
    } else if (quantity > 0 && quantity < 5) {
        return STOCK_STATUS.LOW_INVENTORY;
    } else {
        return STOCK_STATUS.IN_STOCK;
    }
};

productSchema.index({
    product_name: 'text',
    product_description: 'text'
})

productSchema.pre('save', function (next) {
    this.product_slug = slugify(this.product_name, {
        lower: true
    })
    this.product_stockStatus = updateStockStatus(this.product_quantity);
    next()
})
productSchema.pre('updateOne', function (next) {
    const quantity = this.getUpdate().product_quantity;
    if (quantity !== undefined) {
        this.getUpdate().product_stockStatus = updateStockStatus(quantity);
    }
    next();
});
export default mongoose.model(DOCUMENT_NAME, productSchema);