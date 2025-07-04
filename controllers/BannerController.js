import { Sequelize } from "sequelize";
const { Op } = Sequelize;
import db from "../models";
import { BannerStatus } from "../constants";
import { getAvatarUrl } from "../helpers/imageHelper";

export const getBanners = async (req, res) => {
    const { search = '', page = 1 } = req.query;
    const pageSize = 5;
    const offset = (page - 1) * pageSize;
    let whereClause = {};

    if (search.trim() !== '') {
        whereClause = {
            name: { [Op.like]: `%${search}%` }
        };
    }

    const [banners, totalBanners] = await Promise.all([
        db.Banner.findAll({
            where: whereClause,
            limit: pageSize,
            offset: offset,
        }),
        db.Banner.count({
            where: whereClause
        })
    ]);

    return res.status(200).json({
        message: 'Lấy danh sách banner thành công',
        data: banners.map(banner => ({
            ...banner.get({ plain: true }),
            image: getAvatarUrl(banner.image)
        })),
        current_page: parseInt(page, 10),
        total_pages: Math.ceil(totalBanners / pageSize),
        total: totalBanners
    });
};

export async function getBannerById(req, res) {
    const { id } = req.params;
    const banner = await db.Banner.findByPk(id);

    if (!banner) {
        return res.status(404).json({
            message: 'Banner không tìm thấy'
        });
    }

    res.status(200).json({
        message: 'Lấy thông tin banner thành công',
        data: {
            ...banner.get({ plain: true }),
            image: getAvatarUrl(banner.image)
        }
    });
}

export async function insertBanner(req, res) {
    const { name } = req.body;

    const existingBanner = await db.Banner.findOne({
        where: { name: name.trim() }
    })

    if (existingBanner) {
        return res.status(409).json({
            message: 'Tên Banner đã  tồn tại, vui lòng chọn tên khác',
        });
    }

    const bannerData = {
        ...req.body,
        status: BannerStatus.ACTIVE
    }

    const banner = await db.Banner.create(bannerData);

    res.status(201).json({
        message: 'Thêm mới banner thành công',
        data: banner
    });
}

export const deleteBanner = async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await db.Banner.destroy({
            where: { id }
        });

        if (deleted) {
            return res.status(200).json({
                message: 'Xóa banner thành công'
            });
        } else {
            return res.status(404).json({
                message: 'Banner không tìm thấy'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi xóa banner',
            error: error.message
        });
    }
};

export async function updateBanner(req, res) {
    const { id } = req.params;
    const { name } = req.body;

    if (name !== undefined) {
        const existingBanner = await db.Banner.findOne({
            where: {
                name: name,
                id: { [Sequelize.Op.ne]: id }
            }
        })

        if (existingBanner) {
            return res.status(400).json({
                message: 'Tên banner đã tồn tại, vui lòng chọn tên khác'
            });
        }

    }


    const updatedBanner = await db.Banner.update(req.body, {
        where: { id }
    });

    return res.status(200).json({
        message: 'Cập nhật banner thành công'
    });
}
