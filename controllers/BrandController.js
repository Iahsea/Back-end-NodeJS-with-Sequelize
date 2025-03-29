export async function getBrands(req, res) {
    res.status(200).json({
        message: 'Lấy danh sách thương hiệu thành công'
    });
}

export async function getBrandById(req, res) {
    res.status(200).json({
        message: 'Lấy thông tin thương hiệu thành công'
    });
}

export async function insertBrand(req, res) {
    res.status(200).json({
        message: 'Thêm mới thương hiệu thành công'
    });
}

export async function updateBrand(req, res) {
    res.status(200).json({
        message: 'Cập nhật thương hiệu thành công'
    });
}

export async function deleteBrand(req, res) {
    res.status(200).json({
        message: 'Xóa thương hiệu thành công'
    });
}