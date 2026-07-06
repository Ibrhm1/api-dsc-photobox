import { Router, type Request, type Response } from 'express';
import { adminsController } from '../controllers/admins.controller';
import { validateBody } from '../middlewares/validation.middleware';
import { adminsValidation } from '../validations/admins.validation';
import { rateLimitMiddleware } from '../middlewares/rateLimit.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';

const adminsRoute = Router();

adminsRoute.post(
  '/register',
  rateLimitMiddleware,
  validateBody(adminsValidation.registerAdminValidation),
  adminsController.register,
);
adminsRoute.post(
  '/login',
  rateLimitMiddleware,
  validateBody(adminsValidation.loginAdminValidation),
  adminsController.login,
);
adminsRoute.get('/me', authMiddleware, adminsController.me);
adminsRoute.delete('/logout', authMiddleware, adminsController.logout);

export { adminsRoute };
