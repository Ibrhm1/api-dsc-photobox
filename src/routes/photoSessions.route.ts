import { Router } from 'express';
import { photoSessionsController } from '../controllers/photoSessions.controller.ts';

const photoSessionsRoute = Router();

photoSessionsRoute.post('/', photoSessionsController.create);
photoSessionsRoute.get('/gallery', photoSessionsController.getGallery);

export { photoSessionsRoute };
