import inventoryModel from '../inventory.model.js';

const insertInventory = async ({ productId, stock, location }) => {
    return await inventoryModel.create({
        inven_productId: productId,
        inven_stock: stock,
        inven_location: location,
    });
};
// const reservationIventory = async ({
//     productId,
//     quantity,
//     cartId
// }) => {
//     const query = {
//             inven_productId: productId,
//             inven_stock: {
//                 $gte: quantity
//             },
//         },
//         udpateSet = {
//             $inc: {
//                 inven_stock: -quantity
//             },
//             $push: {
//                 inven_reservation: {
//                     quantity,
//                     cartId,
//                     createOn: new Date()
//                 }
//             }
//         },
//         options = {
//             upsert: true,
//             new: true
//         }

//     return await inventoryModel.updateOne(query, udpateSet, options)
// }

const reservationIventory = async ({ productId, quantity, cartId }) => {
    const product = await inventoryModel.findOne({
        inven_productId: productId,
    });

    if (!product || product.inven_stock >= quantity) {
        const query = {
            inven_productId: productId,
            inven_stock: {
                $gte: 0,
            },
        };

        const updateSet = {
            $inc: {
                inven_stock: -quantity,
            },
            $push: {
                inven_reservation: {
                    quantity,
                    cartId,
                    createOn: new Date(),
                },
            },
        };

        const options = {
            upsert: true,
            new: true,
        };

        return await inventoryModel.updateOne(query, updateSet, options);
    } else {
        return null;
    }
};

export { insertInventory, reservationIventory };
