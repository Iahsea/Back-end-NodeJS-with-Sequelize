import { Sequelize } from "sequelize"
import db from "../models"

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
    try {
        // console.log(JSON.stringify(req.body));
        const product = await db.Product.create(req.body)
        await db.Product.create
        res.status(201).json({
            message: 'Thêm mới sản phẩm thành công',
            data: product
        })
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi thêm sản phẩm mới',
            data: error.message
        })
    }
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