import { Sequelize, where } from "sequelize";
const { Op } = Sequelize;
import db from "../models";

export async function getNewsDetails(req, res) {
    const { page = 1 } = req.query; // Mặc định trang đầu tiên
    const pageSize = 5; // Số lượng bản ghi trên mỗi trang
    const offset = (page - 1) * pageSize;

    const [newsDetails, totalNewsDetails] = await Promise.all([
        db.NewsDetail.findAll({
            limit: pageSize,
            offset: offset,
            // include: [{ model: db.News }, { model: db.Product }]
        }),
        db.NewsDetail.count()
    ]);

    return res.status(200).json({
        message: 'Lấy danh sách NewsDetail thành công',
        data: newsDetails,
        current_page: parseInt(page, 10),
        total_pages: Math.ceil(totalNewsDetails / pageSize),
        total: totalNewsDetails
    });
}

export async function getNewsDetailById(req, res) {
    const { id } = req.params;
    const newsDetail = await db.NewsDetail.findByPk(id, {
        include: [{ model: db.News }, { model: db.Product }]
    });

    if (!newsDetail) {
        return res.status(404).json({
            message: 'NewsDetail không tìm thấy'
        });
    }

    res.status(200).json({
        message: 'Lấy thông tin NewsDetail thành công',
        data: newsDetail
    });
}

export async function insertNewsDetail(req, res) {
    const { product_id, news_id } = req.body

    const productExists = await db.Product.findByPk(product_id);
    if (!productExists) {
        return res.status(404).json({
            message: "Sản phẩm không tồn tại"
        });
    }

    const newsExists = await db.News.findByPk(news_id);
    if (!newsExists) {
        return res.status(404).json({
            message: "Tin tức không tồn tại"
        });
    }

    const duplicateExists = await db.NewsDetail.findOne({
        where: { news_id, product_id }
    });

    if (duplicateExists) {
        return res.status(409).json({
            message: "Cặp sản phẩm - tin tức này đã tồn tại"
        });
    }

    const newsDetail = await db.NewsDetail.create({ product_id, news_id });
    res.status(201).json({
        message: 'Thêm mới NewsDetail thành công',
        data: newsDetail
    });
}

export async function deleteNewsDetail(req, res) {
    const { id } = req.params;
    const deleted = await db.NewsDetail.destroy({
        where: { id }
    });

    if (deleted) {
        res.status(200).json({
            message: 'Xóa chi tiết tin tức thành công'
        });
    } else {
        res.status(404).json({
            message: 'Chi tiết tin tức không tìm thấy'
        });
    }
}

export async function updateNewsDetail(req, res) {
    const { id } = req.params;
    const { product_id, news_id } = req.body

    const existingDublicate = await db.NewsDetail.findOne({
        where: {
            product_id,
            news_id,
            id: { [Sequelize.Op.ne]: id }
        }
    });

    if (existingDublicate) {
        return res.status(409).json({
            message: 'Mối quan hệ giữa sản phẩm và tin tức đã tồn tại trong bản ghi khác'
        });
    }

    const updatedNewsDetail = await db.NewsDetail.update({ product_id, news_id }, {
        where: { id }
    });

    if (updatedNewsDetail[0] > 0) {
        return res.status(200).json({
            message: 'Cập nhật chi tiết tin tức thành công'
        });
    } else {
        return res.status(400).json({
            message: 'Chi tiết tin tức không tìm thấy'
        });
    }
}
