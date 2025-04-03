import path from 'path'

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