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
                as: "product_attribute_values",
                include: [
                    {
                        model: db.Attribute, // Bao gồm tên của thuộc tính từ bảng Attribute
                        attributes: ['id', 'name'], // Lấy tên thuộc tính
                    },
                ],
            },
            {
                model: db.ProductVariantValue,
                as: "product_variant_values",
                attribute: ['id', 'price', 'ole_price', 'stock', 'sku'],
            },
        ],
    });

    if (!product) {
        return res.status(404).json({
            message: 'Sản phẩm không tìm thấy'
        });
    }

    // Lấy danh sách variant_values từ các sku trong product_variant_values
    const variantValuesData = [];
    for (const variant of product.product_variant_values) {
        const variantValueIds = variant.sku.split('-').map(Number);
        const variantValues = await db.VariantValue.findAll({
            where: { id: variantValueIds },
            include: [
                {
                    model: db.Variant,
                    as: 'variant',
                    attributes: ['id', 'name'],
                },
            ],
        });

        // Gán variant_values chi tiết vào biến thể hiện tại
        variantValuesData.push({
            id: variant.id,
            price: variant.price,
            old_price: variant.old_price,
            stock: variant.stock,
            sku: variant.sku,
            values: variantValues.map(value => ({
                id: value.id,
                name: value.variant?.name || full,
                value: value.value,
                image: value.image || null
            }))

        })
    }


    res.status(200).json({
        message: 'Lấy thông tin sản phẩm thành công',
        data: {
            ...product.get({ plain: true }),
            image: getAvatarUrl(product.image),
            variants: variantValuesData

        }
    })
}

export async function insertProduct(req, res) {

    const { name, attributes = [], variants = [], variant_values = [], ...productData } = req.body;

    // Kiểm tra xem category_id và brand_id có tồn tại không 

    const { category_id, brand_id } = productData;
    const categoryExists = await db.Category.findByPk(category_id);
    if (!categoryExists) {
        return res.status(400).json({
            message: `Category ID ${category_id} không tồn tại, vui lòng kiểm tra lại`,
        });
    }

    const brandExists = await db.Brand.findByPk(brand_id);
    if (!brandExists) {
        return res.status(400).json({
            message: `Brand ID ${brand_id} không tồn tại, vui lòng kiểm tra lại`,
        });
    }


    // Khởi tạo transaction

    const transaction = await db.sequelize.transaction();

    // Kiểm tra xem tên sản phẩm đã tồn tại chưa
    const productExists = await db.Product.findOne({
        where: { name }
    })

    if (productExists) {
        return res.status(400).json({
            message: 'Tên sản phẩm đã tồn tại, vui lòng chọn tên khác',
            data: productExists
        })
    }

    // Tạo sản phẩm mới trong bảng products
    const product = await db.Product.create(
        { ...productData, name },
        { transaction }
    );

    // Xử lý các thuộc tính động
    const createAttributes = [];
    for (const attr of attributes) {
        // Tìm hoặc tạo thuộc tính trong bảng `attributes`
        const [attribute] = await db.Attribute.findOrCreate({
            where: { name: attr.name },
            transaction,
        });

        // Thêm giá trị thuộc tính vào bảng product_attribute_values
        await db.ProductAttributeValue.create(
            {
                product_id: product.id,
                attribute_id: attribute.id,
                value: attr.value
            },
            { transaction }
        );

        // Lưu trữ thông tin để trả về
        createAttributes.push({
            name: attribute.name,
            value: attr.value,
        });
    }

    // Xử lý các biến thể (variants)
    for (const variant of variants) {
        const [variantEntry] = await db.Variant.findOrCreate({
            where: { name: variant.name },
            transaction,
        });

        for (const value of variant.values) {
            await db.VariantValue.findOrCreate({
                where: { value, variant_id: variantEntry.id },
                transaction,
            });
        }
    }

    // Xử lý các giá trị biến thể (variant_values)
    const createdVariantValues = [];

    for (const variantData of variant_values) {
        const variantValueIds = [];

        for (const value of variantData.variant_combination) {
            const variantValue = await db.VariantValue.findOne({
                where: { value },
                transaction,
            });

            if (variantValue) {
                variantValueIds.push(variantValue.id);
            }
        }

        // Tạo mã SKU theo quy tắc "id1-id2-id3-..."
        const sku = variantValueIds.sort((a, b) => a - b).join('-')


        // Thêm biến thể vào bảng product_variant_values
        const createdVariant = await db.ProductVariantValue.create(
            {
                product_id: product.id,
                price: variantData.price,
                old_price: variantData.old_price || null,
                stock: variantData.stock || 0,
                sku,
            },
            { transaction }
        );

        createdVariantValues.push({
            sku,
            price: createdVariant.price,
            old_price: createdVariant.old_price,
            stock: createdVariant.stock
        });

    }

    // Commit transaction
    await transaction.commit();

    // Trả về thông tin sản phẩm kèm theo các thuộc tính và biến thể
    return res.status(201).json({
        message: 'Thêm mới sản phẩm thành công',
        data: {
            ...product.get({ plain: true }),
            image: getAvatarUrl(product.image),
            attributes: createAttributes,
            variants: variants.map(variant => ({
                name: variant.name,
                values: variant.values,
            })),
            variant_values: createdVariantValues,
        },
    });
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
