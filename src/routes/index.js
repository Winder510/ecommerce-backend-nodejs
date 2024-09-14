import express from 'express'
import accessRouter from './access/index.js'
import productRouter from './product/index.js'
const router = express.Router()

// check apiKey

//check permission


router.use('/api/v1', accessRouter)
router.use('/api/v1/product', productRouter)


export default router