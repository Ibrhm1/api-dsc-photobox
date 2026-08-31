import { Router } from 'express';
import { adminsRoute } from './admins.route.ts';
import { customersRoute } from './customers.route.ts';
import { photoSessionsRoute } from './photoSessions.route.ts';
import { photosRoute } from './photos.route.ts';

const router = Router();

router.get('/', (_req, res) => {
  res.redirect('/');
});
router.use('/photo-sessions', photoSessionsRoute);
router.use('/photos', photosRoute);
router.use('/customers', customersRoute);
router.use('/admins', adminsRoute);

export default router;
