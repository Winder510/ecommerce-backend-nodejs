import express from 'express'
import accessRouter from './access/index.js'
const router = express.Router()

router.use('/api/v1', accessRouter)


export default router