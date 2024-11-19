import {
    acquireLock,
    releaseLock
} from "../../src/services/redis.service";

const testOrderByUserNoLock = () => {

}
const testOrderByUserWithLock = async () => {
    let numberOfProduct = 30;
    let productid = "proid_1";

    const acquireProduct = [];
    // Verify inventory for each product
    for (let i = 0; i < products_order.length; i++) {
        const {
            productId,
            quantity
        } = products_order[i];
        const keyLock = await acquireLock({
            productId,
            quantity,
            cartId
        });
        acquireProduct.push(keyLock ? true : false);

        if (keyLock) {
            await releaseLock(keyLock);
        }
    }

    // Check if any products are out of stock
    if (acquireProduct.includes(false)) {
        throw new BadRequestError('Một số sản phẩm đã được cập nhật vui lòng quay lại');
    }

    return {
        "current volumns": numberOfProduct
    }
}

testOrderByUserWithLock();