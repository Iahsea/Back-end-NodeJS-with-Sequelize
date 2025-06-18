import { Sequelize, where } from "sequelize";
const { Op } = Sequelize;
import db from "../models";
import InsertUserRequest from "../dtos/requests/users/InsertUserRequest";
import ResponseUser from "../dtos/responses/user/ResponseUser";
import argon2 from 'argon2';
import { UserRole } from "../constants";

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
            message: 'Mật khẩu không chính xác'
        });
    }

    // Nếu bạn muốn tạo token JWT, có thể thêm ở đây
    // const token = generateJWT(user);

    return res.status(200).json({
        message: 'Đăng nhập thành công',
        data: {
            user: new ResponseUser(user),
        }
        // token: token, // nếu có token
    });
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
