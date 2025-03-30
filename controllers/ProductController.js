import { Sequelize } from "sequelize"
import db from "../models"
import InsertProductRequest from "../dtos/requests/InsertProductRequest"
import validateHandler from "../middlewares/validate"

export async function getProducts(req, res) {
    res.status(200).json({
        message: 'Lấy danh sách sản phẩm thành công'
    })
}

export async function getProductById(req, res) {
    res.status(200).json({
        message: 'Lấy thông tin sản phẩm thành công'
    })
}

export async function insertProduct(req, res) {
    const product = await db.Product.create(req.body)
    await db.Product.create
    return res.status(201).json({
        message: 'Thêm mới sản phẩm thành công',
        data: product
    })
}

export async function deleteProduct(req, res) {
    res.status(200).json({
        message: 'Xóa sản phẩm thành công'
    })
}

export async function updateProduct(req, res) {
    res.status(200).json({
        message: 'Update sản phẩm thành công'
    })
}