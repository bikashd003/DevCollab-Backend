import { Router } from 'express';
import uploadImage from '../../Controllers/Upload/CloudiNaryUpload.controller.js';
const uploadRouter = Router();
uploadRouter.post('/upload', uploadImage);
export default uploadRouter;


