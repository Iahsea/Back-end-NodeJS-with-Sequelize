import { Sequelize, where } from "sequelize";
const { Op } = Sequelize;
import db from "../models";

export async function getCartItems(req, res) {
    const { cartId } = req.query;
    let whereClause = {};

    if (cartId) {
        whereClause.cartId = cartId;
    }

    const items = await db.CartItem.findAll({ where: whereClause });

    return res.status(200).json({
        message: 'Lấy danh sách sản phẩm trong giỏ hàng thành công',
        data: items
    });
}

export async function getCartItemById(req, res) {
    const { id } = req.params;
    const cartItems = await db.CartItem.findByPk(id);

    if (!cartItems) {
        return res.status(404).json({
            message: 'Mục trong giỏ hàng không tìm thấy'
        })
    }

    return res.status(200).json({
        message: 'Lấy danh sách mục trong giỏ hàng thành công',
        data: cartItems
    });
}

export async function getCartItemByCartId(req, res) {
    const { cart_id } = req.params;
    const cartItems = await db.CartItem.findAll({
        where: { cart_id: cart_id }
    })

    return res.status(200).json({
        message: 'Lấy danh sách mục trong giỏ hàng thành công',
        data: cartItems
    });
}

export async function insertCartItem(req, res) {
    const { product_id, quantity, cart_id } = req.body;

    const productExists = await db.Product.findByPk(product_id);

    if (!productExists) {
        return res.status(404).json({
            message: 'Sản phẩm không tồn tại',
        });
    }


    const cartExists = await db.Cart.findByPk(cart_id)

    if (!cartExists) {
        return res.status(404).json({
            message: 'Giỏ hàng không tồn tại',
        });
    }

    const cartItemExists = await db.CartItem.findOne({
        where: {
            product_id: product_id,
            cart_id: cart_id
        }
    })

    if (quantity === 0) {
        const deleteCartItem = await db.CartItem.destroy({
            where: { id: cartItemExists.id }
        })
        return res.status(201).json({
            message: 'Sản phẩm đã về số lượng là và bị xóa',
            data: deleteCartItem
        });
    }

    if (cartItemExists) {
        const itemUpdate = await db.CartItem.update(req.body, {
            where: { id: cartItemExists.id }
        })
        return res.status(201).json({
            message: 'Update sản phẩm trong giỏ hàng thành công',
            data: itemUpdate
        });
    }

    const item = await db.CartItem.create(req.body);
    return res.status(201).json({
        message: 'Thêm sản phẩm vào giỏ hàng thành công',
        data: item
    });
}

export async function updateCartItem(req, res) {
    const { id } = req.params;
    const updated = await db.CartItem.update(req.body, { where: { id } });

    if (updated[0] > 0) {
        return res.status(200).json({ message: 'Cập nhật sản phẩm trong giỏ hàng thành công' });
    } else {
        return res.status(404).json({ message: 'Sản phẩm không tồn tại trong giỏ hàng' });
    }
}

export async function deleteCartItem(req, res) {
    const { id } = req.params;
    const deleted = await db.CartItem.destroy({ where: { id } });

    if (deleted) {
        return res.status(200).json({ message: 'Xóa sản phẩm khỏi giỏ hàng thành công' });
    } else {
        return res.status(404).json({ message: 'Sản phẩm không tồn tại trong giỏ hàng' });
    }
}
