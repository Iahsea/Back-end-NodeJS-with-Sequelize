import { Model, Sequelize, where } from "sequelize"
const { Op } = Sequelize;
import db from "../models"
import { getAvatarUrl } from "../helpers/imageHelper";

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

    // Khởi tạo `whereClause` cho thuộc tính động
    let attributeWhereClause = {};
    if (search.trim() !== '') {
        attributeWhereClause = {
            value: { [Op.like]: `%${search}` }
        };
    }

    const [products, totalProducts] = await Promise.all([
        db.Product.findAll({
            where: whereClause,
            include: [
                {
                    model: db.ProductAttributeValue,
                    as: "attributes",
                    include: [{ model: db.Attribute }],
                    where: attributeWhereClause,
                    required: false // Không bắt buộc sản phẩm nào cũng có thuộc tính         
                }
            ],
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
        data: products.map(product => ({
            ...product.get({ plain: true }),
            image: getAvatarUrl(product.image),
            attributes: product.attributes.map(attr => ({
                name: attr.Attribute?.name || '', // dùng optional chaining để tránh lỗi
                value: attr.value
            }))
        })),
        current_page: parseInt(page, 10),
        total_pages: Math.ceil(totalProducts / pageSize),
        total: totalProducts
    });

}

export async function getProductById(req, res) {
    const { id } = req.params
    const product = await db.Product.findByPk(id, {
        include: [
            {
                model: db.ProductImage,
                as: 'product_images'
            },
            {
                model: db.ProductAttributeValue,
                as: "attributes",
                include: [
                    {
                        model: db.Attribute, // Bao gồm tên của thuộc tính từ bảng Attribute
                        attributes: ['name'] // Lấy tên thuộc tính
                    }
                ]
            }

        ]
    });

    if (!product) {
        return res.status(404).json({
            message: 'Sản phẩm không tìm thấy'
        });
    }
    res.status(200).json({
        message: 'Lấy thông tin sản phẩm thành công',
        data: {
            ...product.get({ plain: true }),
            image: getAvatarUrl(product.image)
        }
    })
}

export async function insertProduct(req, res) {

    const { name, attributes = [], ...productData } = req.body;

    const productExists = await db.Product.findOne({
        where: { name }
    })

    if (productExists) {
        return res.status(400).json({
            message: 'Tên sản phẩm đã tồn tại, vui lòng chọn tên khác',
            data: productExists
        })
    }

    try {
        // Tạo sản phẩm mới trong bảng products
        const product = await db.Product.create(req.body)

        for (const attr of attributes) {
            // Tìm hoặc tạo thuộc tính trong bảng `attributes`
            const [attribute] = await db.Attribute.findOrCreate({
                where: { name: attr.name }
            });

            // Thêm giá trị thuộc tính vào bảng product_attribute_values
            await db.ProductAttributeValue.create({
                product_id: product.id,
                attribute_id: attribute.id,
                value: attr.value
            });
        }

        return res.status(201).json({
            message: 'Thêm mới sản phẩm thành công',
            data: {
                ...product.get({ plain: true }),
                image: getAvatarUrl(product.image),
                attributes: attributes.map(attr => ({
                    name: attr.name,
                    value: attr.value
                }))
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Có lỗi xảy ra khi thêm sản phẩm',
            error: error.message
        });
    }
}

export async function deleteProduct(req, res) {
    const { id } = req.params

    // Kiểm tra xem sản phẩm có trong bất kì OrderDetail nào không và lấy thông tin chi tiết

    const orderDetailExists = await db.OrderDetail.findOne({
        where: { product_id: id },
        include: [{
            model: db.Order,
            as: 'order',
            attributes: ['id', 'status', 'note', 'total', 'created_at']
        }]
    });

    // Nếu có OrderDetail tham chiếu đến sản phẩm, không cho phép xóa và trả về thông tin đơn hàng

    if (orderDetailExists) {
        return res.status(400).json({
            message: 'Không thể xóa sản phẩm vì đã có đơn hàng tham chiếu đến sản phẩm này',
            data: {
                Order: orderDetailExists.order
            }
        });
    }

    // Xóa các bản ghi trong bảng `product_attribute_values` liên quan đến sản phẩm

    await db.ProductAttributeValue.destroy({
        where: { product_id: id }
    });

    // Xóa sản phẩm khỏi bảng `products`
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
    const { attributes = [], ...productData } = req.body

    const [updatedRowCount] = await db.Product.update(productData, {
        where: { id }
    });

    if (updatedRowCount > 0) {
        // Nếu cập nhật thành công, tiến hành cập nhật thuộc tính động
        for (const attr of attributes) {
            // Tìm hoặc tạo thuộc tính trong bảng `attributes`
            const [attribute] = await db.Attribute.findOrCreate({
                where: { name: attr.name }
            });


            // Tìm xem thuộc tính đã tồn tại cho sản phẩm chưa
            const productAttributeValue = await db.ProductAttributeValue.findOne({
                where: {
                    product_id: id,
                    attribute_id: attribute.id
                }
            });

            if (productAttributeValue) {
                // Nếu thuộc tính đã tồn tại, cập nhật giá trị
                await productAttributeValue.update({ value: attr.value });
            } else {
                // Nếu chưa tồn tại, thêm mới thuộc tính và giá trị vào bảng `product_attribute_values`
                await db.ProductAttributeValue.create({
                    product_id: id,
                    attribute_id: attribute.id,
                    value: attr.value
                });
            }
        }

        return res.status(200).json({
            message: 'Cập nhật sản phẩm thành công'
        });
    } else {
        // Nếu không tìm thấy sản phẩm cần cập nhập
        return res.status(404).json({
            message: 'Sản phẩm không tìm thấy'
        });
    }

}
