import { Sequelize } from "sequelize"
const { Op } = Sequelize;
import db from "../models"

export async function getBrands(req, res) {
    const { search = '', page = 1 } = req.query; // Mặc định tìm kiếm rỗng và trang đầu tiên
    const pageSize = 5; // Số lượng thương hiệu trên mỗi trang
    const offset = (page - 1) * pageSize;
    let whereClause = {};

    if (search.trim() !== '') {
        whereClause = {
            [Op.or]: [
                { name: { [Op.like]: `%${search}%` } },
            ]
        };
    }

    const [brands, totalBrands] = await Promise.all([
        db.Brand.findAll({
            where: whereClause,
            limit: pageSize,
            offset: offset,
            // Có thể thêm `order` nếu cần sắp xếp
        }),
        db.Brand.count({
            where: whereClause
        })
    ]);

    return res.status(200).json({
        message: 'Lấy danh sách thương hiệu thành công',
        data: brands,
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(totalBrands / pageSize),
        totalBrands
    });
}

export async function getBrandById(req, res) {
    const { id } = req.params;
    const brand = await db.Brand.findByPk(id);

    if (!brand) {
        return res.status(404).json({
            message: 'Thương hiệu không tìm thấy'
        });
    }

    res.status(200).json({
        message: 'Lấy thông tin thương hiệu thành công',
        data: brand
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