import express from 'express'
import accessRouter from './access/index.js'
import productRouter from './product/index.js'
import discountRouter from './discount/index.js'

const router = express.Router()

// check apiKey

//check permission

router.use('/api/v1/discount', discountRouter)
router.use('/api/v1/product', productRouter)
router.use('/api/v1', accessRouter)


export default router