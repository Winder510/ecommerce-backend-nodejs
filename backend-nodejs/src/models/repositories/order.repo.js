import skuModel from '../sku.model.js';
import spuModel from '../spu.model.js';
import {
    getProductInforForCart
} from './cart.repo.js';

const checkSkuByServer = async (products) => {
    return await Promise.all(
        products.map(async (product) => {
            try {
                let foundProduct;
                foundProduct = await getProductInforForCart(product.skuId);
                if (foundProduct) {
                    return {
                        price: foundProduct.originalPrice,
                        loyalPoint: foundProduct.loyalPoint * product.quantity,
                        priceAfterDiscount: foundProduct.originalPrice,
                        discount: foundProduct.discount,
                        quantity: product.quantity,
                        spuId: product.spuId,
                    };
                } else {
                    throw new Error(`Product not found: ${product.productId}`);
                }
            } catch (error) {
                return {
                    error: error.message,
                    productId: product.productId,
                };
            }
        }),
    );
};

const handleDeliverOrder = async (order) => {
    const productUpdates = order.order_products.map(product => ({
        updateOne: {
            filter: {
                _id: product.spuId
            },
            update: {
                $inc: {
                    product_revenue: product.priceAfterDiscount * product.quantity,
                    product_quantitySold: product.quantity,
                    product_quantity: -product.quantity
                }
            }
        }
    }));

    const skuUpdate = order.order_products.map(product => ({
        updateOne: {
            filter: {
                _id: product.skuId
            },
            update: {
                $inc: {
                    sku_stock: -product.quantity,
                    sku_quantitySold: product.quantity
                }
            }
        }
    }));
    if (productUpdates.length > 0) {
        await spuModel.bulkWrite(productUpdates);
        await skuModel.bulkWrite(skuUpdate);
    }
}
export {
    checkSkuByServer,
    handleDeliverOrder
};