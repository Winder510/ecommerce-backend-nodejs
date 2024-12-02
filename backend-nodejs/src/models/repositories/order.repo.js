import {
    getProductInforForCart
} from './cart.repo.js';

const checkSkuByServer = async (products) => {
    return await Promise.all(
        products.map(async (product) => {
            try {
                let foundProduct;
                foundProduct = await getProductInforForCart(product.productId);
                if (foundProduct) {
                    return {
                        price: foundProduct.originalPrice,
                        loyalPoint: foundProduct.loyalPoint,
                        priceAfterDiscount: foundProduct.originalPrice,
                        discount: foundProduct.discount,
                        quantity: product.quantity,
                        productId: product.productId,
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
export {
    checkSkuByServer
};