import Joi from "joi";
import { argon2d, argon2i, argon2id } from "argon2";
import { UserRole } from "../../../constants";

class InsertUserRequest {
    constructor(data) {
        this.email = data.email;
        this.password = data.password; // Mã hóa mật khẩu trước khi lưu
        this.name = data.name;
        this.avatar = data.avatar;
        this.phone = data.phone;
    }

    static validate(data) {
        const schema = Joi.object({
            email: Joi.string().email().optional(),
            password: Joi.string().min(6).optional(), //optional(login Facebook, Google)
            name: Joi.string().required(),
            avatar: Joi.string().uri().allow('').optional(),
            phone: Joi.string().optional()
        });

        return schema.validate(data); // { error, value }
    }
}

export default InsertUserRequest;
