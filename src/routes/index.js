import express from 'express'
import accessRouter from './access/index.js'
import productRouter from './product/index.js'
import discountRouter from './discount/index.js'
import cartRouter from './cart/index.js'
import checkoutRouter from './checkout/index.js'

const router = express.Router()

// check apiKey

//check permission

router.use('/api/v1/checkout', checkoutRouter)
router.use('/api/v1/cart', cartRouter)
router.use('/api/v1/discount', discountRouter)
router.use('/api/v1/product', productRouter)
router.use('/api/v1', accessRouter)


export default router