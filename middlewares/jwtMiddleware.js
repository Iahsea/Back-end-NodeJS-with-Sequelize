import { getUserFromToken } from "../helpers/tokenHelper";

const requireRoles = (rolesRequired) => async (req, res, next) => {
    const user = await getUserFromToken(req, res);

    if (!user) return;

    if (user.is_locked === 1) {
        return res.status(403).json({ message: 'Tài khoản này đã bị khóa' });
    }

    if (!rolesRequired.includes(user.role)) {
        return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    req.user = user; // Lưu thông tin người dùng vào request
    next(); // Chuyển tới middleware tiếp theo
};

export { requireRoles };