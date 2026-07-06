import { Router } from 'express';
import { photosController } from '../controllers/photos.controller';
import { uploadFiles } from '../middlewares/upload.middleware';

const photosRoute = Router();

photosRoute.post('/:sessionId', uploadFiles('files'), photosController.create);

export { photosRoute };
