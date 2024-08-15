import cloudinary from "../../Config/Cloudinary.js"
import multer from "multer"
import path from "path"
import { AppError } from "../../Utils/AppError.js"
const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`)
    },
});

const fileFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Error: Images Only!'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
}).single('image');

const uploadImage = async (req, res) => {
    try {
        await new Promise((resolve, reject) => {
            upload(req, res, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        if (!req.file) {
            throw new AppError('No file uploaded', 400);
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'Projects',
        });

        return res.status(200).json({
            imageUrl: result.secure_url,
            publicId: result.public_id
        });
    } catch (error) {
        throw new AppError(error.message, 500);
    }
};
const deleteImage = async (req, res) => {
    try {
        const { publicId } = req.body;

        if (!publicId) {
            return res.status(400).json({ error: 'Public ID is required' });
        }

        // Delete the image from Cloudinary
        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result === 'ok') {
            return res.status(200).json({ message: 'Image deleted successfully' });
        } else {
            throw new AppError('Image not found or already deleted', 404);
        }
    } catch (error) {
        throw new AppError(error.message, 500);
    }
};
export { uploadImage, deleteImage };
