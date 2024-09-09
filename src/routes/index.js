import express from 'express'
import accessRouter from './access/index.js'
const router = express.Router()

// check apiKey

//check permission


router.use('/api/v1', accessRouter)


export default router