import { Router } from 'express';
import { customersRoute } from './customers.route';
import { photoSessionsRoute } from './photoSessions.route';
import { photosRoute } from './photos.route';

const router = Router();

router.get('/', (_req, res) => {
  res.redirect('/');
});
router.use('/photo-sessions', photoSessionsRoute);
router.use('/photos', photosRoute);
router.use('/customers', customersRoute);

export default router;
