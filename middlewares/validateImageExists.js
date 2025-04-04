import fs from 'fs';
import path from 'path';

const validateImageExists = (req, res, next) => {
    const imageName = req.body.image;

    if (imageName && !imageName.startsWith('http://') && !imageName.startsWith('https://')) {
        // Construct the path to where the image should be located
        const imagePath = path.join(__dirname, '../uploads', imageName);

        // Check if the image file exists
        if (!fs.existsSync(imagePath)) {
            // If the file does not exists, send an error response
            return res.status(404).json({
                message: 'File ảnh không tồn tại',
            })
        }
    }
    next();
};

export default validateImageExists