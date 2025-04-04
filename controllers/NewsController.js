import { Sequelize } from "sequelize"
const { Op } = Sequelize;
import db from "../models"

export const getNewsArticles = async (req, res) => {
    const { search = '', page = 1 } = req.query;
    const pageSize = 5;
    const offset = (page - 1) * pageSize;
    let whereClause = {};

    if (search.trim() !== '') {
        whereClause = {
            [Op.or]: [
                { title: { [Op.like]: `%${search}%` } },
                { content: { [Op.like]: `%${search}%` } }
            ]
        };
    }

    const [news, totalNews] = await Promise.all([
        db.News.findAll({
            where: whereClause,
            limit: pageSize,
            offset: offset,
        }),
        db.News.count({
            where: whereClause
        })
    ]);

    return res.status(200).json({
        message: 'Lấy danh sách tin tức thành công',
        data: news,
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(totalNews / pageSize),
        totalNews
    });
}

export async function getNewsArticleById(req, res) {
    const { id } = req.params;
    const news = await db.News.findByPk(id);

    if (!news) {
        return res.status(404).json({
            message: 'Tin tức không tìm thấy'
        });
    }

    res.status(200).json({
        message: 'Lấy thông tin tin tức thành công',
        data: news
    });
}

export async function insertNewsArticle(req, res) {
    const transaction = await db.sequelize.transaction();

    try {
        const news = await db.News.create(req.body, { transaction });

        const productIds = req.body.product_ids;

        if (productIds && productIds.length) {
            const validProducts = await db.Product.findAll({
                where: {
                    id: productIds
                },
                transaction
            });

            const validProductIds = validProducts.map(product => product.id);

            const filteredProductIds = productIds.filter(id => validProductIds.includes(id));

            const newsDetailPromises = filteredProductIds.map(product_id =>
                db.NewsDetail.create({
                    product_id: product_id,
                    news_id: news.id
                }, { transaction })
            );

            await Promise.all(newsDetailPromises);
        }
        await transaction.commit();
        res.status(201).json({
            message: 'Thêm mới tin tức thành công',
            data: news
        });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
            message: 'Không thể thêm tin tức mới',
            error: error.message
        });
    }
}

export const deleteNewsArticle = async (req, res) => {
    const { id } = req.params;
    const transaction = await db.sequelize.transaction();

    try {
        await db.NewsDetail.destroy({
            where: { news_id: id },
            transaction: transaction
        });

        const deleted = await db.News.destroy({
            where: { id },
            transaction: transaction
        });

        if (deleted) {
            await transaction.commit()
            return res.status(200).json({
                message: 'Xóa bài báo thành công'
            });
        } else {
            await transaction.rollback();
            return res.status(404).json({
                message: 'Bài báo không tìm thấy'
            });
        }
    } catch (error) {
        await transaction.rollback(); // Rollback nếu có lỗi
        res.status(500).json({
            message: 'Lỗi khi xóa bài báo',
            error: error.message
        });
    }
};


export async function updateNewsArticle(req, res) {
    const { id } = req.params;
    const { tittle } = req.body;

    const existingArticle = await db.News.findOne({
        where: {
            tittle: tittle,
            id: { [Sequelize.Op.ne]: id }
        }
    })

    if (existingArticle) {
        return res.status(400).json({
            message: 'Tên tiêu đề đã tồn tại, vui lòng chọn tiêu đề khác'
        });
    }


    const updatedNews = await db.News.update(req.body, {
        where: { id }
    });

    if (updatedNews[0] > 0) {
        return res.status(200).json({
            message: 'Cập nhật tin tức thành công'
        });
    } else {
        return res.status(400).json({
            message: 'Tin tức không tìm thấy'
        });
    }
}
