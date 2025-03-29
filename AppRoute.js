import express from 'express'
const router = express.Router()
import * as ProductController from './controllers/ProductController'

export function AppRoute(app) {
    router.get('/products', ProductController.getProducts)
    router.get('/products/:id', ProductController.getProductById)
    router.post('/products', ProductController.insertProduct)
    router.put('/products', ProductController.updateProduct)
    router.delete('/products/:id', ProductController.deleteProduct)

    app.use('/api/', router)
}