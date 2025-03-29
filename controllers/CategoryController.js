import { Sequelize } from "sequelize"
import db from "../models"

export async function getCategories(req, res) {
    res.status(200).json({
        message: 'Lấy danh sách danh mục thành công'
    });
}

export async function getCategoryById(req, res) {
    res.status(200).json({
        message: 'Lấy thông tin danh mục thành công'
    });
}

export async function insertCategory(req, res) {
    try {
        const category = await db.Category.create(req.body);
        res.status(201).json({
            message: 'Thêm mới danh mục thành công',
            data: category
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi thêm danh mục mới',
            data: error.message
        });
    }
}

export async function deleteCategory(req, res) {
    res.status(200).json({
        message: 'Xóa danh mục thành công'
    });
}

export async function updateCategory(req, res) {
    res.status(200).json({
        message: 'Cập nhật danh mục thành công'
    });
}
