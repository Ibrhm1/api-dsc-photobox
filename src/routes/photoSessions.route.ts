import { Router } from 'express';
import { photoSessionsController } from '../controllers/photoSessions.controller';

const photoSessionsRoute = Router();

photoSessionsRoute.post(
  '/',

  photoSessionsController.create,
);

export { photoSessionsRoute };
