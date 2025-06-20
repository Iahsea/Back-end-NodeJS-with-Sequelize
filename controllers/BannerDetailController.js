import { Sequelize, where } from "sequelize";
const { Op } = Sequelize;
import db from "../models";

export const getBannerDetails = async (req, res) => {
    const { page = 1 } = req.query;
    const pageSize = 5;
    const offset = (page - 1) * pageSize;

    const [bannerDetails, totalBannerDetails] = await Promise.all([
        db.BannerDetail.findAll({
            limit: pageSize,
            offset: offset,
        }),
        db.BannerDetail.count()
    ]);

    return res.status(200).json({
        message: "Lấy danh sách Banner Detail thành công",
        data: bannerDetails,
        current_page: parseInt(page, 10),
        total_pages: Math.ceil(totalBannerDetails / pageSize),
        total: totalBannerDetails
    });
};

export const getBannerDetailById = async (req, res) => {
    const { id } = req.params;
    const bannerDetail = await db.BannerDetail.findByPk(id);

    if (!bannerDetail) {
        return res.status(404).json({
            message: "Banner Detail không tìm thấy"
        });
    }

    res.status(200).json({
        message: "Lấy thông tin Banner Detail thành công",
        data: bannerDetail
    });
};

export const insertBannerDetail = async (req, res) => {
    const { product_id, banner_id } = req.body;

    const productExists = await db.Product.findByPk(product_id);
    if (!productExists) {
        return res.status(404).json({
            message: "Sản phẩm không tồn tại"
        });
    }

    const bannerExists = await db.Banner.findByPk(banner_id);
    if (!bannerExists) {
        return res.status(404).json({
            message: "Banner không tồn tại"
        });
    }

    const duplicateExists = await db.BannerDetail.findOne({
        where: { product_id, banner_id }
    })

    if (duplicateExists) {
        return res.status(409).json({
            message: "Cặp sản phẩm - banner này đã tồn tại"
        });
    }
    const bannerDetail = await db.BannerDetail.create({ product_id, banner_id });

    res.status(201).json({
        message: "Thêm mới Banner Detail thành công",
        data: bannerDetail
    });
};

export const deleteBannerDetail = async (req, res) => {
    const { id } = req.params;
    const deleted = await db.BannerDetail.destroy({
        where: { id }
    });

    if (deleted) {
        return res.status(200).json({
            message: "Xóa Banner Detail thành công"
        });
    } else {
        return res.status(404).json({
            message: "Banner Detail không tìm thấy"
        });
    }
};

export const updateBannerDetail = async (req, res) => {
    const { id } = req.params;
    const { product_id, banner_id } = req.body;

    const productExists = await db.Product.findByPk(product_id);
    if (!productExists) {
        return res.status(404).json({
            message: "Sản phẩm không tồn tại"
        });
    }

    const bannerExists = await db.Banner.findByPk(banner_id);
    if (!bannerExists) {
        return res.status(404).json({
            message: "Banner không tồn tại"
        });
    }

    const existingBannerDetail = await db.BannerDetail.findOne({
        where: {
            product_id,
            banner_id,
            id: { [Sequelize.Op.ne]: id }
        }
    })

    if (existingBannerDetail) {
        return res.status(409).json({
            message: 'Mối quan hệ giữa sản phẩm và banner đã tồn tại trong bản ghi khác'
        });
    }
    const updatedBannerDetail = await db.BannerDetail.update(req.body, {
        where: { id }
    });

    if (updatedBannerDetail[0] > 0) {
        return res.status(200).json({
            message: "Cập nhật Banner Detail thành công"
        });
    } else {
        return res.status(400).json({
            message: "Banner Detail không tìm thấy"
        });
    }
};
