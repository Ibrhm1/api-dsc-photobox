import { Router } from 'express';
import { adminsController } from '../controllers/admins.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminAuthRateLimiter } from '../middlewares/rateLimit.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import { adminsValidation } from '../validations/admins.validation';

const adminsRoute = Router();

adminsRoute.post(
  '/register',
  adminAuthRateLimiter,
  validateBody(adminsValidation.registerAdminValidation),
  adminsController.register,
);
adminsRoute.post(
  '/login',
  adminAuthRateLimiter,
  validateBody(adminsValidation.loginAdminValidation),
  adminsController.login,
);
adminsRoute.post('/export', authMiddleware, adminsController.exportBucket);
adminsRoute.get('/export', authMiddleware, adminsController.exportBucket);
adminsRoute.get('/me', authMiddleware, adminsController.me);
adminsRoute.get('/customers', authMiddleware, adminsController.getAllCustomers);
adminsRoute.get('/sessions', authMiddleware, adminsController.getAllSessions);
adminsRoute.delete('/logout', authMiddleware, adminsController.logout);
adminsRoute.delete('/clear', authMiddleware, adminsController.resetDatabase);

export { adminsRoute };
