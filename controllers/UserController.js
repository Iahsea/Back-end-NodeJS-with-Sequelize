import { Sequelize, where } from "sequelize";
const { Op } = Sequelize;
import db from "../models";
import InsertUserRequest from "../dtos/requests/users/InsertUserRequest";
import ResponseUser from "../dtos/responses/user/ResponseUser";
import argon2 from 'argon2';
import { UserRole } from "../constants";
import jwt from 'jsonwebtoken'
import { now } from "sequelize/lib/utils";
require('dotenv').config();
import os from 'os';
import { getAvatarUrl } from "../helpers/imageHelper";

// Thêm mới người dùng
export async function registerUser(req, res) {
    const { email, phone, password } = req.body;

    if (!email && !phone) {
        return res.status(400).json({
            message: 'Cần cung cấp email hoặc số điện thoại'
        });
    }

    const condition = {};
    if (email) condition.email = email;
    if (phone) condition.phone = phone;

    const existingUser = await db.User.findOne({ where: condition });

    if (existingUser) {
        return res.status(409).json({
            message: 'Email hoặc số điện thoại đã tồn tại'
        });
    }
    const hashedPassword = await argon2.hash(req.body.password)
    const user = await db.User.create({
        ...req.body,
        email,
        phone,
        password: hashedPassword,
        role: UserRole.USER
    })

    return res.status(201).json({
        message: 'Đăng ký người dùng thành công',
        data: new ResponseUser(user)
    });

}

export async function loginUser(req, res) {
    const { email, phone, password } = req.body;

    if (!email && !phone) {
        return res.status(400).json({
            message: 'Cần cung cấp email hoặc số điện thoại'
        });
    }

    const condition = {};
    if (email) condition.email = email;
    if (phone) condition.phone = phone;

    const user = await db.User.findOne({ where: condition });

    if (!user) {
        return res.status(401).json({
            message: 'Tên hoặc mật khẩu không chính xác'
        });
    }

    const PasswordValid = password && await argon2.verify(user.password, password);

    if (!PasswordValid) {
        return res.status(401).json({
            message: 'Tên hoặc mật khẩu không chính xác'
        });
    }

    // Generate a JWT(JSON Web Token)

    const token = jwt.sign(
        {
            id: user.id, //most important
            //role: user.role
            iat: Math.floor(Date.now() / 1000) // Thêm thời điểm tạo token
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRATION
        }
    )

    // Nếu bạn muốn tạo token JWT, có thể thêm ở đây
    // const token = generateJWT(user);

    return res.status(200).json({
        message: 'Đăng nhập thành công',
        data: {
            user: new ResponseUser(user),
            token
        }
        // token: token, // nếu có token
    });
}

// Cập nhật thông tin người dùng
export async function updateUser(req, res) {
    const { id } = req.params;
    const { name, avatar, old_password, new_password } = req.body;

    if (req.user.id != id) {
        return res.status(403).json({
            message: 'Không được phép cập nhật thông tin của người dùng khác'
        });
    }

    const user = await db.User.findByPk(id);
    if (!user) {
        return res.status(404).json({
            message: 'Người dùng không tìm thấy'
        });
    }

    // Cập nhật mật khẩu nếu cần

    if (new_password && old_password) {
        // Kiểm tra mật khẩu cũ
        const passwordValid = await argon2.verify(user.password, old_password);

        if (!passwordValid) {
            return res.status(401).json({
                message: 'Mật khẩu cũ không chính xác'
            });
        }

        // Hash mật khẩu mới
        user.password = await argon2.hash(new_password);
        user.password_changed_at = new Date(); // Cập nhật thời gian thay đổi mật khẩu
    } else if (new_password || old_password) {
        // Nếu chỉ có một trong hai trường mật khẩu mới hoặc cũ được gửi lên
        return res.status(400).json({
            message: 'Cần cả mật khẩu mới và mật khẩu cũ để cập nhật mật khẩu'
        });
    }

    user.name = name || user.name;
    user.avatar = avatar || user.avatar;

    await user.save()

    return res.status(200).json({
        message: 'Cập nhật người dùng thành công',
        data: {
            ...user.get({ plain: true }),
            avatar: getAvatarUrl(user.avatar)
        }
    });
}


export const getUserById = async (req, res) => {
    const { id } = req.params;

    if (req.user.id != id && req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({
            message: 'Chỉ người dùng hoặc quản trị viên mới có quyền truy cập thông tin này'
        });
    }

    const user = await db.User.findByPk(id, {
        attributes: { exclude: ['password'] }
    });

    if (!user) {
        return res.status(404).json({
            message: 'Người dùng không tìm thấy'
        });
    }

    return res.status(200).json({
        message: 'Lấy thông tin người dùng thành công',
        data: {
            ...user.get({ plain: true }),
            avatar: getAvatarUrl(user.avatar)
        }
    })
}
