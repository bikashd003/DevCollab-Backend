import cloudinary from "../../Config/Cloudinary.js"
import multer from "multer"
import path from "path"

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
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'Projects', // Specify the folder in Cloudinary
        });

        // Return the URL of the uploaded image
        return res.status(200).json({ imageUrl: result.secure_url });
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Failed to upload image' });
    }
};

export default uploadImage;
