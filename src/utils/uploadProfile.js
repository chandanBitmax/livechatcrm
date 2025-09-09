const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: './uploads/profile',
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const allowed = ['.jpg', '.jpeg', '.webp', '.avif', '.png'];

        if (!allowed.includes(ext)) {
            return cb(new Error('Invalid file type'));
        }

        cb(null, `${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});
module.exports = upload;