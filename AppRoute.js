import express from 'express'
const router = express.Router()
import * as UserController from './controllers/UserController'
import * as ProductController from './controllers/ProductController'
import * as CategoryController from './controllers/CategoryController'
import * as BrandController from './controllers/BrandController'
import * as OrderController from './controllers/OrderController'
import * as OrderDetailController from './controllers/OrderDetailController'
import * as NewsController from './controllers/NewsController'

import asyncHandler from './middlewares/asyncHandler'
import validate from './middlewares/validate'
import InsertProductRequest from './dtos/requests/product/InsertProductRequest'
import UpdateProductRequest from './dtos/requests/product/UpdateProductRequest'
import InsertOrderRequest from './dtos/requests/order/InsertOrderRequest'
import InsertUserRequest from './dtos/requests/users/InsertUserRequest'
import InsertNewsRequest from './dtos/requests/news/InsertNewsRequest'

export function AppRoute(app) {
    // User Routes
    router.post('/users',
        validate(InsertUserRequest),
        asyncHandler(UserController.insertUser)
    );

    // Product Routes
    router.get('/products', asyncHandler(ProductController.getProducts));
    router.get('/products/:id', asyncHandler(ProductController.getProductById));
    router.post('/products',
        validate(InsertProductRequest),
        asyncHandler(ProductController.insertProduct)
    );
    router.delete('/products/:id', asyncHandler(ProductController.deleteProduct));
    router.put('/products/:id',
        validate(UpdateProductRequest),
        asyncHandler(ProductController.updateProduct));

    // Category Routes
    router.get('/categories', asyncHandler(CategoryController.getCategories));
    router.get('/categories/:id', asyncHandler(CategoryController.getCategoryById));
    router.post('/categories', asyncHandler(CategoryController.insertCategory));
    router.delete('/categories/:id', asyncHandler(CategoryController.deleteCategory));
    router.put('/categories', asyncHandler(CategoryController.updateCategory));

    // Brand Routes
    router.get('/brands', asyncHandler(BrandController.getBrands));
    router.get('/brands/:id', asyncHandler(BrandController.getBrandById));
    router.post('/brands', asyncHandler(BrandController.insertBrand));
    router.put('/brands', asyncHandler(BrandController.updateBrand));
    router.delete('/brands/:id', asyncHandler(BrandController.deleteBrand));

    // Order Routes
    router.get('/orders', asyncHandler(OrderController.getOrders));
    router.get('/orders/:id', asyncHandler(OrderController.getOrderById));
    router.post('/orders',
        validate(InsertOrderRequest),
        asyncHandler(OrderController.insertOrder));
    router.put('/orders', asyncHandler(OrderController.updateOrder));
    router.delete('/orders/:id', asyncHandler(OrderController.deleteOrder));

    // Order Detail Routes
    router.get('/order-details', asyncHandler(OrderDetailController.getOrderDetails));
    router.get('/order-details/:id', asyncHandler(OrderDetailController.getOrderDetailById));
    router.post('/order-details', asyncHandler(OrderDetailController.insertOrderDetail));
    router.put('/order-details', asyncHandler(OrderDetailController.updateOrderDetail));
    router.delete('/order-details/:id', asyncHandler(OrderDetailController.deleteOrderDetail));

    // News Routes
    router.get('/news', asyncHandler(NewsController.getNewsArticles));
    router.get('/news/:id', asyncHandler(NewsController.getNewsArticleById));
    router.post('/news',
        validate(InsertNewsRequest),
        asyncHandler(NewsController.insertNewsArticle));
    router.delete('/news/:id', asyncHandler(NewsController.deleteNewsArticle));
    router.put('/news', asyncHandler(NewsController.updateNewsArticle));



    app.use('/api/', router)
}