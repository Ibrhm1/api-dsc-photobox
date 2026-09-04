import { Router } from 'express';
import { customersController } from '../controllers/customers.controller.ts';
import {
  validateBody,
  validateParams,
} from '../middlewares/validation.middleware.ts';
import { customersValidation } from '../validations/customers.validation.ts';

const customersRoute = Router();

customersRoute.post(
  '/:sessionId',
  validateParams(customersValidation.queryParamsCustomerValidation),
  validateBody(customersValidation.createCustomerValidation),
  customersController.create,
);

export { customersRoute };
