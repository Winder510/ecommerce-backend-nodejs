import express from 'express'
import morgan from 'morgan'
import helmet from "helmet";
import compression from 'compression'
const app = express()
//init db
import './dbs/init.mongo.js'

// init middleware
app.use(morgan("dev"))
app.use(helmet())
app.use(compression())

app.get('/', (req, res) => {
    res.status(200).send('Hello world!')
})

export default app;