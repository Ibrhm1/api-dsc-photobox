import { Router } from 'express';
import { adminsRoute } from './admins.route.js';
import { customersRoute } from './customers.route.js';
import { photoSessionsRoute } from './photoSessions.route.js';
import { photosRoute } from './photos.route.js';

const router = Router();

router.get('/', (_req, res) => {
  res.redirect('/');
});
router.use('/photo-sessions', photoSessionsRoute);
router.use('/photos', photosRoute);
router.use('/customers', customersRoute);
router.use('/admins', adminsRoute);

export default router;
