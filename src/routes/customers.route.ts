import { Router } from 'express';
import { customersController } from '../controllers/customers.controller.js';
import {
  validateBody,
  validateParams,
} from '../middlewares/validation.middleware.js';
import { customersValidation } from '../validations/customers.validation.js';

const customersRoute = Router();

customersRoute.post(
  '/:sessionId',
  validateParams(customersValidation.queryParamsCustomerValidation),
  validateBody(customersValidation.createCustomerValidation),
  customersController.create,
);

export { customersRoute };
