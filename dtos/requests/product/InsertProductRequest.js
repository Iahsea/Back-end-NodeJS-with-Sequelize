import Joi from "joi";
class InsertProductRequest {
    constructor(data) {
        this.name = data.name;
        this.price = data.price;
        this.oldprice = data.oldprice;
        this.image = data.image;
        this.description = data.description;
        this.specification = data.specification;
        this.buyturn = data.buyturn;
        this.quantity = data.quantity;
        this.brand_id = data.brand_id;
        this.category_id = data.category_id;
        this.attributes = data.attributes; // Mảng attributes động
        this.variants = data.variants;
    }
    static validate(data) {
        const schema = Joi.object({
            name: Joi.string().required(),
            price: Joi.number().positive().required(),
            oldprice: Joi.number().positive(),
            image: Joi.string().allow(""),
            description: Joi.string().optional(),
            specification: Joi.string().required(),
            buyturn: Joi.number().integer().min(0),
            quantity: Joi.number().integer().min(0),
            brand_id: Joi.number().integer().required(),
            category_id: Joi.number().integer().required(),
            attributes: Joi.array().items(
                Joi.object({
                    name: Joi.string().required(), // Tên thuộc tính, ví dụ : "Màn hình", "RAM"
                    value: Joi.string().required() // Giá trị thuộc tính, ví dụ: "6.7 inch", "8GB"
                })
            ).optional(), // Mảng attributes là optional
            variants: Joi.array().items(
                Joi.object({
                    name: Joi.string().required(),
                    values: Joi.array().items(Joi.string().required()).required()
                })
            ).optional(),
            variant_values: Joi.array().items(
                Joi.object({
                    variant_combination: Joi.array()
                        .items(Joi.string().required())
                        .required(), // ví dụ: ["Combo", "iPhone 14"]
                    price: Joi.number().positive().required(),
                    old_price: Joi.number().positive().optional(),
                    stock: Joi.number().integer().min(0).required()
                })
            ).optional()

        });

        return schema.validate(data) //{error, value}
    }
}

export default InsertProductRequest

// SELECT * FROM information_schema.table_constraints
// WHERE table_schema = 'shopapp_online' AND table_name = 'products';