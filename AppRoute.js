import express from 'express'
const router = express.Router()
import * as ProductController from './controllers/ProductController'
import * as CategoryController from './controllers/CategoryController'
import * as BrandController from './controllers/BrandController'
import * as OrderController from './controllers/OrderController'
import * as OrderDetailController from './controllers/OrderDetailController'
import asyncHandler from './middlewares/asyncHandler'

export function AppRoute(app) {
    // Product Routes
    router.get('/products', ProductController.getProducts)
    router.get('/products/:id', ProductController.getProductById)
    router.post('/products', asyncHandler(ProductController.insertProduct))
    router.delete('/products/:id', ProductController.deleteProduct)
    router.put('/products', ProductController.updateProduct)

    // Category Routes
    router.get('/categories', CategoryController.getCategories);
    router.get('/categories/:id', CategoryController.getCategoryById);
    router.post('/categories', CategoryController.insertCategory);
    router.delete('/categories/:id', CategoryController.deleteCategory);
    router.put('/categories', CategoryController.updateCategory);

    // Brand Routes
    router.get('/brands', BrandController.getBrands);
    router.get('/brands/:id', BrandController.getBrandById);
    router.post('/brands', BrandController.insertBrand);
    router.put('/brands', BrandController.updateBrand);
    router.delete('/brands/:id', BrandController.deleteBrand);

    // Order Routes
    router.get('/orders', OrderController.getOrders);
    router.get('/orders/:id', OrderController.getOrderById);
    router.post('/orders', OrderController.insertOrder);
    router.put('/orders', OrderController.updateOrder);
    router.delete('/orders/:id', OrderController.deleteOrder);

    // Order Detail Routes
    router.get('/order-details', OrderDetailController.getOrderDetails);
    router.get('/order-details/:id', OrderDetailController.getOrderDetailById);
    router.post('/order-details', OrderDetailController.insertOrderDetail);
    router.put('/order-details', OrderDetailController.updateOrderDetail);
    router.delete('/order-details/:id', OrderDetailController.deleteOrderDetail);

    app.use('/api/', router)
}