import { Sequelize } from "sequelize"
import db from "../models"
import InsertProductRequest from "../dtos/requests/InsertProductRequest"

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
    const { error } = InsertProductRequest.validate(req.body) //destructuring an object
    if (error) {
        return res.status(400).json({
            message: 'Lỗi khi thêm sản phẩm mới',
            // errors: error.details
            error: error.details[0]?.message
        });
    }
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