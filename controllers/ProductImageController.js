import { Sequelize } from "sequelize";
const { Op } = Sequelize;
import db from "../models";

export async function getProductImages(req, res) {
    const { product_id, page = 1 } = req.query;
    const pageSize = 5;
    const offset = (page - 1) * pageSize;

    let whereClause = {};

    if (product_id) {
        whereClause.product_id = product_id;
    }


    const [productImages, totalProductImages] = await Promise.all([
        db.ProductImage.findAll({
            where: whereClause,
            limit: pageSize,
            offset: offset,
            // include: [{ model: db.Product, as: 'Product' }]
        }),
        db.ProductImage.count({
            where: whereClause
        })
    ]);

    return res.status(200).json({
        message: 'Lấy danh sách ảnh sản phẩm thành công',
        data: productImages,
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(totalProductImages / pageSize),
        totalProductImages
    });
}

export async function getProductImageById(req, res) {
    const { id } = req.params;
    const productImage = await db.ProductImage.findByPk(id);

    if (!productImage) {
        return res.status(404).json({
            message: 'Ảnh sản phẩm không tìm thấy'
        });
    }

    res.status(200).json({
        message: 'Lấy thông tin ảnh sản phẩm thành công',
        data: productImage
    });
}

export async function insertProductImage(req, res) {
    const { product_id, image_url } = req.body;

    const product = await db.Product.findByPk(product_id)

    if (!product) {
        return res.status(404).json({
            message: 'Sản phẩm không tồn tại'
        });
    }

    const existingImage = await db.ProductImage.findOne({
        where: {
            product_id: product_id,
            image_url: image_url
        }
    })

    if (existingImage) {
        return res.status(409).json({
            message: "Ảnh này đã được liên kết với sản phẩm này"
        });
    }

    const productImage = await db.ProductImage.create(req.body);

    res.status(201).json({
        message: 'Thêm mới ảnh sản phẩm thành công',
        data: productImage
    });
}

export async function deleteProductImage(req, res) {
    const { id } = req.params;
    const deleted = await db.ProductImage.destroy({
        where: { id }
    });

    if (deleted) {
        return res.status(200).json({
            message: 'Xóa ảnh sản phẩm thành công'
        });
    } else {
        return res.status(404).json({
            message: 'Ảnh sản phẩm không tìm thấy'
        });
    }
}

// export async function updateProductImage(req, res) {
//     const { id } = req.params;
//     const { product_id, image_url } = req.body;

//     if (product_id !== undefined || image_url !== undefined) {
//         const updatedProductImage = await db.ProductImage.update(req.body, {
//             where: { id }
//         });

//         if (updatedProductImage[0] > 0) {
//             return res.status(200).json({
//                 message: 'Cập nhật ảnh sản phẩm thành công'
//             });
//         } else {
//             return res.status(400).json({
//                 message: 'Ảnh sản phẩm không tìm thấy'
//             });
//         }
//     } else {
//         return res.status(400).json({
//             message: 'Dữ liệu không hợp lệ'
//         });
//     }
// }
