import inventoryModel from "../inventory.model.js"

const insertInventory = async ({
    productId,
    stock,
    location
}) => {
    return await inventoryModel.create({
        inven_productId: productId,
        inven_stock: stock,
        inven_location: location
    })
}
const reservationIventory = async ({
    productId,
    quantity,
    cartId
}) => {
    const query = {
            inven_productId: productId,
            inven_stock: {
                $gte: quantity
            },
        },
        udpateSet = {
            $inc: {
                inven_stock: -quantity
            },
            $push: {
                inven_reservation: {
                    quantity,
                    cartId,
                    createOn: new Date()
                }
            }
        },
        options = {
            upsert: true,
            new: true
        }

    return await inventoryModel.updateOne(query, udpateSet, options)
}
export {
    insertInventory,
    reservationIventory
}