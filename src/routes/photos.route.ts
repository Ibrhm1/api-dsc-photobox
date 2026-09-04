import { Router } from 'express';
import { photosController } from '../controllers/photos.controller.ts';
import { uploadFiles } from '../middlewares/upload.middleware.ts';

const photosRoute = Router();

photosRoute.post('/:sessionId', uploadFiles('files'), photosController.create);
photosRoute.get('/:sessionId', photosController.getAll);

export { photosRoute };
