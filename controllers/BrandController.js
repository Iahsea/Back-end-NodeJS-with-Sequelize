import { Sequelize } from "sequelize"
import db from "../models"

export async function getBrands(req, res) {
    res.status(200).json({
        message: 'Lấy danh sách thương hiệu thành công'
    });
}

export async function getBrandById(req, res) {
    res.status(200).json({
        message: 'Lấy thông tin thương hiệu thành công'
    });
}

export async function insertBrand(req, res) {
    try {
        const brand = await db.Brand.create(req.body);
        res.status(201).json({
            message: 'Thêm mới thương hiệu thành công',
            data: brand
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi thêm thương hiệu mới',
            data: error.message
        });
    }
}


export async function updateBrand(req, res) {
    res.status(200).json({
        message: 'Cập nhật thương hiệu thành công'
    });
}

export async function deleteBrand(req, res) {
    res.status(200).json({
        message: 'Xóa thương hiệu thành công'
    });
}