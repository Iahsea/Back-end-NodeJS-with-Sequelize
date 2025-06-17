import { Sequelize, where } from "sequelize";
const { Op } = Sequelize;
import db from "../models";

export async function getCarts(req, res) {
    const { session_id, user_id, page = 1 } = req.query;
    const pageSize = 5;
    const offset = (page - 1) * pageSize;

    let whereClause = {}
    if (session_id) whereClause.session_id = session_id;
    if (user_id) whereClause.user_id = user_id;

    const [carts, totalCarts] = await Promise.all([
        db.Cart.findAll({
            where: whereClause,
            include: [{
                model: db.CartItem,
                as: 'cart_items'
            }],
            limit: pageSize,
            offset: offset
        }),
        db.Cart.count()
    ]);

    return res.status(200).json({
        message: 'Lấy danh sách giỏ hàng thành công',
        data: carts,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCarts / pageSize),
        totalCarts
    });
}

export async function getCartById(req, res) {
    const { id } = req.params;
    const cart = await db.Cart.findByPk(id, {
        include: [{
            model: db.CartItem,
            as: 'cart_items'
        }],
    });

    if (!cart) {
        return res.status(404).json({ message: 'Giỏ hàng không tìm thấy' });
    }
    return res.status(200).json({
        message: 'Lấy thông tin giỏ hàng thành công',
        data: cart
    });
}

export async function insertCart(req, res) {
    const { session_id, user_id } = req.body;

    if ((session_id && user_id) || (!session_id && !user_id)) {
        return res.status(400).json({
            message: 'Chỉ được cung cấp một trong hai giá trị session_id hoặc user_id',
        });
    }

    const existingCart = await db.Cart.findOne({
        where: {
            [Op.or]: [
                { session_id: session_id ? session_id : null },
                { user_id: user_id ? user_id : null }
            ]
        }
    });

    if (existingCart) {
        return res.status(409).json({
            message: 'Một giỏ hàng với cùng session_id đã tồn tại',
        });
    }

    const cart = await db.Cart.create(req.body);
    return res.status(201).json({
        message: 'Thêm mới giỏ hàng thành công',
        data: cart
    });
}

// export async function updateCart(req, res) {
//     const { id } = req.params;
//     const updated = await db.Cart.update(req.body, { where: { id } });

//     if (updated[0] > 0) {
//         return res.status(200).json({ message: 'Cập nhật giỏ hàng thành công' });
//     } else {
//         return res.status(404).json({ message: 'Giỏ hàng không tìm thấy' });
//     }
// }

export const checkoutCart = async (req, res) => {
    const { cart_id, total, note } = req.body;
    const transaction = await db.sequelize.transaction();

    try {
        const cart = await db.Cart.findByPk(cart_id, {
            include: [{
                model: db.CartItem,
                as: 'cart_items',
                include: [{
                    model: db.Product,
                    as: 'product'
                }]
            }]
        });
        if (!cart || !cart.cart_items.length) {
            return res.status(404).json({ message: 'Giỏ hàng không tồn tại hoặc trống' });
        }

        const newOrder = await db.Order.create({
            user_id: cart.user_id,
            session_id: cart.session_id,
            total: total || cart.cart_items.reduce((acc, item) => acc + item.quantity * item.product.price, 0),
            note: note
        }, { transaction: transaction });


        for (let item of cart.cart_items) {
            await db.OrderDetail.create({
                order_id: newOrder.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.product.price
            }, { transaction: transaction });
        }

        await db.CartItem.destroy({
            where: { cart_id: cart_id }
        }, { transaction: transaction });

        await cart.destroy({ transaction: transaction });

        await transaction.commit();

        res.status(201).json({
            message: "Thanh toán giỏ hàng thành công",
            data: newOrder
        })
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
            message: "Lỗi khi thanh toán giỏ hàng",
            error: error.message
        });
    }
}


export async function deleteCart(req, res) {
    const { id } = req.params;
    const deleted = await db.Cart.destroy({ where: { id } });

    if (deleted) {
        return res.status(200).json({ message: 'Xóa giỏ hàng thành công' });
    } else {
        return res.status(404).json({ message: 'Giỏ hàng không tìm thấy' });
    }
}
