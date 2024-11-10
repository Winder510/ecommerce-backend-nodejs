import { BadRequestError } from '../core/error.response.js';
import inventoryModel from '../models/inventory.model.js';
import { getProductById } from '../models/repositories/product.repo.js';

class InventoryService {
    static async addStockToInventory({ stock, productId, location = 'QB' }) {
        const product = await getProductById(productId);
        if (!product) {
            throw new BadRequestError('The product does not exists');
        }
        const query = {
                inven_productId: productId,
            },
            updateSet = {
                $inc: {
                    inven_stock: stock,
                },
                $set: {
                    inven_location: location,
                },
            },
            options = {
                upsert: true,
                new: true,
            };
        return await inventoryModel.findOneAndUpdate(query, updateSet, options);
    }
}

export default InventoryService;
