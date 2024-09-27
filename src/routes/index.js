import express from 'express'
import accessRouter from './access/index.js'
import productRouter from './product/index.js'
import discountRouter from './discount/index.js'
import cartRouter from './cart/index.js'
import checkoutRouter from './checkout/index.js'
import inventoryRouter from './inventory/index.js'
import notificationRouter from './notification/index.js'
import uploadRouter from './upload/index.js'


const router = express.Router()

// check apiKey

//check permission
router.use('/api/v1/upload', uploadRouter)
router.use('/api/v1/inventory', inventoryRouter)
router.use('/api/v1/notification', notificationRouter)
router.use('/api/v1/checkout', checkoutRouter)
router.use('/api/v1/cart', cartRouter)
router.use('/api/v1/discount', discountRouter)
router.use('/api/v1/product', productRouter)
router.use('/api/v1', accessRouter)



export default router