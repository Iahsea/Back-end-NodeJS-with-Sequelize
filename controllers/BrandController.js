import { Sequelize } from "sequelize"
const { Op } = Sequelize;
import db from "../models"
import { getAvatarUrl } from "../helpers/imageHelper";

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
        data: brands.map(brand => ({
            ...brand.get({ plain: true }),
            image: getAvatarUrl(brand.image)
        })),
        current_page: parseInt(page, 10),
        total_pages: Math.ceil(totalBrands / pageSize),
        total: totalBrands
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
        data: {
            ...brand.get({ plain: true }),
            image: getAvatarUrl(brand.image)
        }
    });
}

export async function insertBrand(req, res) {
    const brand = await db.Brand.create(req.body);
    res.status(201).json({
        message: 'Thêm mới thương hiệu thành công',
        data: {
            ...brand.get({ plain: true }),
            image: getAvatarUrl(brand.image)
        }
    });
}


export async function updateBrand(req, res) {
    const { id } = req.params;
    const { name } = req.body;

    if (name !== undefined) {
        const existingBrand = await db.Brand.findOne({
            where: {
                name: name,
                id: { [Sequelize.Op.ne]: id }
            }
        })

        if (existingBrand) {
            return res.status(400).json({
                message: 'Tên thương hiệu đã tồn tại, vui lòng chọn tên khác'
            });
        }
    }

    const updatedBrand = await db.Brand.update(req.body, {
        where: { id }
    });

    if (updatedBrand[0] > 0) {
        return res.status(200).json({
            message: 'Cập nhật thương hiệu thành công'
        });
    } else {
        return res.status(400).json({
            message: 'Thương hiệu không tìm thấy'
        });
    }
}

export async function deleteBrand(req, res) {
    const { id } = req.params;
    const deleted = await db.Brand.destroy({
        where: { id }
    });

    if (deleted) {
        res.status(200).json({
            message: 'Xóa thương hiệu thành công'
        });
    } else {
        res.status(404).json({
            message: 'Thương hiệu không tìm thấy'
        });
    }
}