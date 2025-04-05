import path from 'path'
import fs from 'fs'
import db from "../models"


export async function uploadImages(req, res) {
    // Kiểm tra nếu không có file nào được tải lên 
    if (req.files.length === 0) {
        throw new Error('Không có file nào được tải lên')
    }
    // Trả về đường dẫn của các file ảnh được tải lên
    const uploadedImagesPaths = req.files.map(file => path.basename(file.path).trim());

    res.status(201).json({
        message: 'Tải ảnh lên thành công',
        files: uploadedImagesPaths
    })
}

export async function deleteImage(req, res) {
    const { url: rawUrl } = req.body;
    const url = rawUrl.trim();

    try {
        // Check if the ịmgarURL is still in use in many of the databas tables
        const isInUse = await checkImageInUse(url)
        if (isInUse) {
            throw new Error('Ảnh vẫn đang được sử dụng trong cơ sở dũ liệu');
        }
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            // Assume url is a local filename
            const filePath = path.join(__dirname, '../uploads/', path.basename(url));
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
            }
            return res.status(200).json({ message: 'Ảnh đã được xóa thành công' });
        } else {
            return res.status(400).json({ message: 'URL không hợp lệ' });
        }


    } catch (error) {
        return res.status(500).json({ message: 'Lỗi khi xóa ảnh', error: error.message })
    }
}

export async function viewImage(req, res) {
    const { fileName } = req.params
    const imagePath = path.join(path.join(__dirname, '../uploads'), fileName)
    // Check if the file exists
    fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (err) {
            // If the file does not exists, send a 404 response
            return res.status(404).send('Image not found');
        }
        // If the file exists, send it as the response
        res.sendFile(imagePath)
    })
}

async function checkImageInUse(imageUrl) {
    const models = [db.Category, db.Brand, db.Product, db.News, db.Banner];
    for (let model of models) {
        const result = await model.findOne({ where: { image: imageUrl } });
        if (result) return true;
    }
    return false;
}
