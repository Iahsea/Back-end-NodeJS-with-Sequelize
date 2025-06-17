import { Sequelize } from "sequelize"
import db from "../models"


export async function getOrders(req, res) {
    res.status(200).json({
        message: 'Lấy danh sách đơn hàng thành công'
    });
}

export async function getOrderById(req, res) {
    const { id } = req.params;

    const order = await db.Order.findByPk(id, {
        attributes: ['id', 'user_id', 'status', 'note', 'total', 'created_at', 'updated_at'], // ← loại bỏ brand_id
        include: [{
            model: db.OrderDetail,
            as: 'order_details'
        }]
    })

    if (!order) {
        return res.status(404).json({
            message: 'Đơn hàng không tìm thấy'
        });
    }
    res.status(200).json({
        message: 'Lấy thông tin đơn hàng thành công',
        data: order
    });
}

// export async function insertOrder(req, res) {
//     const userId = req.body.user_id;

//     const userExists = await db.User.findByPk(userId)

//     if (!userExists) {
//         return res.status(404).json({
//             message: 'Người dùng không tồn tại'
//         });
//     }

//     const newOrder = await db.Order.create(req.body);

//     if (newOrder) {
//         return res.status(201).json({
//             message: 'Thêm mới đơn hàng thành công',
//             order: newOrder
//         });
//     } else {
//         return res.status(400).json({
//             message: 'Không thể thêm mới đơn hàng'
//         });
//     }
// }

export async function updateOrder(req, res) {
    const { id } = req.params;
    const updatedOrder = await db.Order.update(req.body, {
        where: { id }
    });

    if (updatedOrder[0] > 0) {
        return res.status(200).json({
            message: 'Cập nhật đơn hàng thành công'
        });
    } else {
        return res.status(400).json({
            message: 'Đơn hàng không tìm thấy'
        });
    }
}

export async function deleteOrder(req, res) {
    const { id } = req.params;
    const deleted = await db.Order.destroy({
        where: { id }
    });

    if (deleted) {
        res.status(200).json({
            message: 'Xóa đơn hàng thành công'
        });
    } else {
        res.status(404).json({
            message: 'Đơn hàng không tìm thấy'
        });
    }
}
