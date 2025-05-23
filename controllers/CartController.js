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
    const cart = await db.Cart.findByPk(id);

    if (!cart) {
        return res.status(404).json({ message: 'Giỏ hàng không tìm thấy' });
    }

    return res.status(200).json({
        message: 'Lấy thông tin giỏ hàng thành công',
        data: cart
    });
}

export async function insertCart(req, res) {
    const { session_id } = req.body;

    const existingCart = await db.Cart.findOne({
        where: { session_id }
    })

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

export async function deleteCart(req, res) {
    const { id } = req.params;
    const deleted = await db.Cart.destroy({ where: { id } });

    if (deleted) {
        return res.status(200).json({ message: 'Xóa giỏ hàng thành công' });
    } else {
        return res.status(404).json({ message: 'Giỏ hàng không tìm thấy' });
    }
}
