import { Router } from 'express';
import { photosController } from '../controllers/photos.controller.js';
import { uploadFiles } from '../middlewares/upload.middleware.js';

const photosRoute = Router();

photosRoute.post('/:sessionId', uploadFiles('files'), photosController.create);
photosRoute.get('/:sessionId', photosController.getAll);

export { photosRoute };
