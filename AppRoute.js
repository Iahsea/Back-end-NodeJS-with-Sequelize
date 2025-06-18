import express from 'express'
const router = express.Router()
import * as UserController from './controllers/UserController'
import * as ProductController from './controllers/ProductController'
import * as CategoryController from './controllers/CategoryController'
import * as BrandController from './controllers/BrandController'
import * as OrderController from './controllers/OrderController'
import * as OrderDetailController from './controllers/OrderDetailController'
import * as NewsController from './controllers/NewsController'
import * as NewsDetailController from './controllers/NewsDetailController'
import * as BannerController from './controllers/BannerController'
import * as BannerDetailController from './controllers/BannerDetailController'
import * as ImageController from './controllers/ImageController'
import * as ProductImageController from './controllers/ProductImageController'
import * as CartController from './controllers/CartController'
import * as CartItemController from './controllers/CartItemController'




import asyncHandler from './middlewares/asyncHandler'
import validate from './middlewares/validate'
import validateImageExists from './middlewares/validateImageExists'
import uploadImageMiddleware from './middlewares/imageUpload'

import InsertProductRequest from './dtos/requests/product/InsertProductRequest'
import UpdateProductRequest from './dtos/requests/product/UpdateProductRequest'
import InsertOrderRequest from './dtos/requests/order/InsertOrderRequest'
import InsertUserRequest from './dtos/requests/users/InsertUserRequest'
import LoginUserRequest from './dtos/requests/users/LoginUserRequest'
import InsertNewsRequest from './dtos/requests/news/InsertNewsRequest'
import InsertNewsDetailRequest from './dtos/requests/newsdetail/InsertNewsDetailRequest'
import UpdateNewsRequest from './dtos/requests/news/UpdateNewsRequest'
import InsertBannerRequest from './dtos/requests/banner/InsertBannerRequest'
import InsertBannerDetailRequest from './dtos/requests/banner_detail/InsertBannerDetailRequest'
import InsertProductImageRequest from './dtos/requests/product_images/InsertProductImageRequest'
import InsertCartRequest from './dtos/requests/cart/InsertCartRequest'
import InsertCartItemRequest from './dtos/requests/cart_item/InsertCartItemRequest'
import UpdateOrderRequest from './dtos/requests/order/UpdateOrderRequest'




export function AppRoute(app) {
    // User Routes
    router.post('/users/register',
        validate(InsertUserRequest),
        asyncHandler(UserController.registerUser)
    );
    router.post('/users/login',
        validate(LoginUserRequest),
        asyncHandler(UserController.loginUser)
    );

    // Product Routes
    router.get('/products', asyncHandler(ProductController.getProducts));
    router.get('/products/:id', asyncHandler(ProductController.getProductById));
    router.post('/products',
        validateImageExists,
        validate(InsertProductRequest),
        asyncHandler(ProductController.insertProduct)
    );
    router.delete('/products/:id', asyncHandler(ProductController.deleteProduct));
    router.put('/products/:id',
        validateImageExists,
        validate(UpdateProductRequest),
        asyncHandler(ProductController.updateProduct));

    // ProductImage Routes
    router.get('/product_images', asyncHandler(ProductImageController.getProductImages));
    router.get('/product_images/:id', asyncHandler(ProductImageController.getProductImageById));
    router.post('/product_images',
        validate(InsertProductImageRequest),
        asyncHandler(ProductImageController.insertProductImage));
    // router.put('/product_images', asyncHandler(ProductImageController.updateProductImage));
    router.delete('/product_images/:id', asyncHandler(ProductImageController.deleteProductImage));

    // Category Routes
    router.get('/categories', asyncHandler(CategoryController.getCategories));
    router.get('/categories/:id', asyncHandler(CategoryController.getCategoryById));
    router.post('/categories',
        validateImageExists,
        asyncHandler(CategoryController.insertCategory));
    router.delete('/categories/:id', asyncHandler(CategoryController.deleteCategory));
    router.put('/categories/:id',
        validateImageExists,
        asyncHandler(CategoryController.updateCategory));

    // Brand Routes
    router.get('/brands', asyncHandler(BrandController.getBrands));
    router.get('/brands/:id', asyncHandler(BrandController.getBrandById));
    router.post('/brands',
        validateImageExists,
        asyncHandler(BrandController.insertBrand));
    router.put('/brands/:id',
        validateImageExists,
        asyncHandler(BrandController.updateBrand));
    router.delete('/brands/:id', asyncHandler(BrandController.deleteBrand));

    // Order Routes
    router.get('/orders', asyncHandler(OrderController.getOrders));
    router.get('/orders/:id', asyncHandler(OrderController.getOrderById));
    /*
    router.post('/orders',
        validate(InsertOrderRequest),
        asyncHandler(OrderController.insertOrder));
    */
    router.put('/orders',
        validate(UpdateOrderRequest),
        asyncHandler(OrderController.updateOrder));
    router.delete('/orders/:id', asyncHandler(OrderController.deleteOrder));

    // Order Detail Routes
    router.get('/order-details', asyncHandler(OrderDetailController.getOrderDetails));
    router.get('/order-details/:id', asyncHandler(OrderDetailController.getOrderDetailById));
    router.post('/order-details', asyncHandler(OrderDetailController.insertOrderDetail));
    router.put('/order-details', asyncHandler(OrderDetailController.updateOrderDetail));
    router.delete('/order-details/:id', asyncHandler(OrderDetailController.deleteOrderDetail));

    // Cart Routes
    router.get('/carts', asyncHandler(CartController.getCarts));
    router.get('/carts/:id', asyncHandler(CartController.getCartById));
    router.post('/carts',
        validate(InsertCartRequest),
        asyncHandler(CartController.insertCart));
    router.post('/carts/checkout', asyncHandler(CartController.checkoutCart));
    // router.put('/carts/:id', asyncHandler(CartController.updateCart));
    router.delete('/carts/:id', asyncHandler(CartController.deleteCart));

    // Cart Item Routes
    router.get('/cart_items', asyncHandler(CartItemController.getCartItems));
    router.get('/cart_items/:id', asyncHandler(CartItemController.getCartItemById));
    router.get('/cart_items/carts/:cart_id', asyncHandler(CartItemController.getCartItemByCartId));
    router.post('/cart_items',
        validate(InsertCartItemRequest),
        asyncHandler(CartItemController.insertCartItem));
    router.put('/cart_items/:id', asyncHandler(CartItemController.updateCartItem));
    router.delete('/cart_items/:id', asyncHandler(CartItemController.deleteCartItem));



    // News Routes
    router.get('/news', asyncHandler(NewsController.getNewsArticles));
    router.get('/news/:id', asyncHandler(NewsController.getNewsArticleById));
    router.post('/news',
        validateImageExists,
        validate(InsertNewsRequest),
        asyncHandler(NewsController.insertNewsArticle));
    router.delete('/news/:id', asyncHandler(NewsController.deleteNewsArticle));
    router.put('/news/:id',
        validate(UpdateNewsRequest),
        validateImageExists,
        asyncHandler(NewsController.updateNewsArticle));

    // News Detail Routes
    router.get('/news-details', asyncHandler(NewsDetailController.getNewsDetails));
    router.get('/news-details/:id', asyncHandler(NewsDetailController.getNewsDetailById));
    router.post('/news-details',
        validate(InsertNewsDetailRequest),
        asyncHandler(NewsDetailController.insertNewsDetail));
    router.put('/news-details/:id', asyncHandler(NewsDetailController.updateNewsDetail));
    router.delete('/news-details/:id', asyncHandler(NewsDetailController.deleteNewsDetail));

    // Banner Routes
    router.get('/banners', asyncHandler(BannerController.getBanners));
    router.get('/banners/:id', asyncHandler(BannerController.getBannerById));
    router.post('/banners',
        validate(InsertBannerRequest),
        validateImageExists,
        asyncHandler(BannerController.insertBanner));
    router.put('/banners/:id',
        validateImageExists,
        asyncHandler(BannerController.updateBanner));
    router.delete('/banners/:id', asyncHandler(BannerController.deleteBanner));

    // BannerDetail Routes
    router.get('/banner-details', asyncHandler(BannerDetailController.getBannerDetails));
    router.get('/banner-details/:id', asyncHandler(BannerDetailController.getBannerDetailById));
    router.post('/banner-details',
        validate(InsertBannerDetailRequest),
        asyncHandler(BannerDetailController.insertBannerDetail));
    router.put('/banner-details/:id', asyncHandler(BannerDetailController.updateBannerDetail));
    router.delete('/banner-details/:id', asyncHandler(BannerDetailController.deleteBannerDetail));


    // Images Routes
    router.post('/images/upload',
        uploadImageMiddleware.array('images', 5), // max 5 photo
        asyncHandler(ImageController.uploadImages));
    router.delete('/images/delete', asyncHandler(ImageController.deleteImage));

    router.get('/images/:fileName', asyncHandler(ImageController.viewImage));



    app.use('/api/', router)
}