import { SuccessResponse } from '../core/success.response.js';
import InventoryService from '../services/inventory.service.js';

class InventoryController {
    addStockToInventory = async (req, res, next) => {
        new SuccessResponse({
            message: ' addStock success ',
            metadata: await InventoryService.addStockToInventory(req.body),
        }).send(res);
    };
}
export default new InventoryController();
