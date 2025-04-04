import path from 'path'
import fs from 'fs'


export async function uploadImages(req, res) {
    // Kiểm tra nếu không có file nào được tải lên 
    if (req.files.length === 0) {
        throw new Error('Không có file nào được tải lên')
    }
    // Trả về đường dẫn của các file ảnh được tải lên
    const uploadedImagesPaths = req.files.map(file => path.basename(file.path));

    res.status(201).json({
        message: 'Tải ảnh lên thành công',
        files: uploadedImagesPaths
    })
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