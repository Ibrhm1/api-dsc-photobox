import { Request, request, Response, response, Router } from 'express';
import { adminsController } from '../controllers/admins.controller';
import { validateBody } from '../middlewares/validation.middleware';
import { adminsValidation } from '../validations/admins.validation';
import { authMiddleware } from '../middlewares/auth.middleware';

const adminsRoute = Router();

adminsRoute.post(
  '/register',
  validateBody(adminsValidation.registerAdminValidation),
  adminsController.register,
);
adminsRoute.post(
  '/login',
  validateBody(adminsValidation.loginAdminValidation),
  adminsController.login,
);

export { adminsRoute };
