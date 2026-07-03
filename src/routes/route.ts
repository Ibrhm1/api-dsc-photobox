import { Router } from 'express';
import { photoSessionsRoute } from './photoSessions.route';

const router = Router();

router.use('/photo-sessions', photoSessionsRoute);

export default router;
