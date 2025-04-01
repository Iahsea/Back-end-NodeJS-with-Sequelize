import { Sequelize } from "sequelize"
const { Op } = Sequelize;
import db from "../models"

export async function getProducts(req, res) {
    // const products = await db.Product.findAll()
    const { search = '', page = 1 } = req.query // Default to an empty search and first page if not specified
    const pageSize = 8; // Define the number of items per page
    const offset = (page - 1) * pageSize;
    let whereClause = {};
    if (search.trim() !== '') {
        whereClause = {
            [Op.or]: [
                { name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
                { specification: { [Op.like]: `%${search}%` } }
            ]
        };
    }
    const [products, totalProducts] = await Promise.all([
        db.Product.findAll({
            where: whereClause,
            limit: pageSize,
            offset: offset,
            // Consider adding `order` if you need shorting
        }),
        db.Product.count({
            where: whereClause
        })
    ]);
    return res.status(200).json({
        message: 'lấy danh sách sản phẩm thành công',
        data: products,
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(totalProducts / pageSize),
        totalProducts
    });

}

export async function getProductById(req, res) {
    const { id } = req.params
    const product = await db.Product.findByPk(id);

    if (!product) {
        return res.status(404).json({
            message: 'Sản phẩm không tìm thấy'
        });
    }
    res.status(200).json({
        message: 'Lấy thông tin sản phẩm thành công',
        data: product
    })
}

export async function insertProduct(req, res) {
    const product = await db.Product.create(req.body)
    // await db.Product.create
    return res.status(201).json({
        message: 'Thêm mới sản phẩm thành công',
        data: product
    })
}

export async function deleteProduct(req, res) {
    const { id } = req.params
    const deleted = await db.Product.destroy({
        where: { id }
    })
    if (deleted) {
        res.status(200).json({
            message: 'Xóa sản phẩm thành công',
        })
    } else {
        res.status(404).json({
            message: 'Sản phẩm không tìm thấy',
        });
    }
}

export async function updateProduct(req, res) {
    const { id } = req.params;
    const updatedProduct = await db.Product.update(req.body, {
        where: { id }
    });
    if (updatedProduct[0] > 0) {
        return res.status(200).json({
            message: 'Update sản phẩm thành công'
        });
    } else {
        return res.status(400).json({
            message: 'Sản phẩm không tìm thấy'
        });
    }
}