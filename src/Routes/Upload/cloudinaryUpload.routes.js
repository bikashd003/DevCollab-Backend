import { Router } from 'express';
import { uploadImage, deleteImage } from '../../Controllers/Upload/CloudiNaryUpload.controller.js';
const uploadRouter = Router();
uploadRouter.post('/upload', uploadImage);
uploadRouter.post('/delete', deleteImage);
export default uploadRouter;


