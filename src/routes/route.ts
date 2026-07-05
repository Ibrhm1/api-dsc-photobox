import { Router } from 'express';
import { customersRoute } from './customers.route';
import { photoSessionsRoute } from './photoSessions.route';

const router = Router();

router.use('/photo-sessions', photoSessionsRoute);
router.use('/customers', customersRoute);

export default router;
