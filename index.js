// const express = require('express')
import express from 'express'
import dotenv from 'dotenv'
import { getProducts } from './controllers/ProductController'
dotenv.config()

const app = express()
app.use(express.json())
express.urlencoded({ extended: true })
import { AppRoute } from './AppRoute'

app.get('/', (req, res) => {
    res.send('Hello World!')
})

const port = process?.env?.PORT ?? 3321

AppRoute(app)

app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${port}`)
})