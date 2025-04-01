import { Sequelize, where } from "sequelize";
const { Op } = Sequelize;
import db from "../models";
import InsertUserRequest from "../dtos/requests/users/InsertUserRequest";
import ResponseUser from "../dtos/responses/user/ResponseUser";
import argon2 from 'argon2';

// Thêm mới người dùng
export async function insertUser(req, res) {
    // Check if a user with the given email already exists
    const existingUser = await db.User.findOne({ where: { email: req.body.email } });
    if (existingUser) {
        return res.status(409).json({
            message: 'Email đã tồn tại'
        });
    }
    const hashedPassword = await argon2.hash(req.body.password)
    const user = await db.User.create({
        ...req.body,
        password: hashedPassword
    })
    if (user) {
        return res.status(201).json({
            message: 'Thêm mới người dùng thành công',
            data: new ResponseUser(user)
        });
    } else {
        return res.status(201).json({
            message: 'Không thể thêm người dùng'
        });
    }

}

// Cập nhật thông tin người dùng
export async function updateUser(req, res) {
    const { id } = req.params;
    const updatedUser = await db.User.update(req.body, {
        where: { id }
    });

    if (updatedUser[0] > 0) {
        return res.status(200).json({
            message: 'Cập nhật người dùng thành công'
        });
    } else {
        return res.status(400).json({
            message: 'Người dùng không tồn tại'
        });
    }
}
