import jwt from 'jsonwebtoken';
import db from '../models'; // Nhớ thêm `.js` nếu dùng ESM
import dotenv from 'dotenv';

dotenv.config(); // Load biến môi trường từ .env

const JWT_SECRET = process.env.JWT_SECRET;

export async function getUserFromToken(req, res) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Error('Không có token được cung cấp')
        }


        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        // Kiểm tra xem token có được tạo sau khi mật khẩu thay đổi không

        const user = await db.User.findByPk(decoded.id);

        if (!user) {
            throw new Error('Người dùng không tồn tại');
        }

        if (user.password_changed_at &&
            decoded.iat < new Date(user.password_changed_at).getTime() / 1000) {
            throw new Error('Token không hợp lệ do mật khẩu đã thay đổi')
        }

        return user; // Token hợp lệ và tìm thấy người dùng
    } catch (error) {
        res.status(401).json({
            message: 'Token không hợp lệ hoặc đã hết hạn',
            error: error.toString()
        });
        return null;
    }
}

