/*
{
    productId: "spu-567",
    product_name: "Áo thun",
    isVariant: false
},
{
    productId: "sku-123",
    product_name: "Áo thun màu đỏ, size M",
    isVariant: true,
}
*/

import {
    findSkuById
} from "./sku.repo.js";
import {
    findSpuById
} from "./spu.repo.js";

const checkSpuByServer = async (products) => {
    return await Promise.all(products.map(async product => {
        try {
            let foundProduct;
            // Kiểm tra thông tin sản phẩm
            if (product.isVariant) {
                foundProduct = await findSkuById(product.productId);
                if (foundProduct && foundProduct.product_id) {
                    throw new Error(`SKU mismatch: ${product.productId} does not belong to SPU ${product.parentSpu}`);
                }
            } else {
                // Truy vấn từ database để kiểm tra SPU hợp lệ
                foundProduct = await findSpuById(product.productId);
            }
            if (foundProduct) {
                return {
                    price: (product.isVariant ? foundProduct.sku_price : foundProduct.product_price),
                    quantity: product.quantity,
                    productId: product.productId
                };
            } else {
                throw new Error(`Product not found: ${product.productId}`);
            }
        } catch (error) {
            return {
                error: error.message,
                productId: product.productId
            };
        }
    }));
}
export {
    checkSpuByServer
}