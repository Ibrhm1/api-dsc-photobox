import { Router } from 'express';
import { customersController } from '../controllers/customers.controller';
import {
  validateBody,
  validateParams,
} from '../middlewares/validation.middleware';
import { customersValidation } from '../validations/customers.validation';

const customersRoute = Router();

customersRoute.post(
  '/:sessionId',
  validateParams(customersValidation.queryParamsCustomerValidation),
  validateBody(customersValidation.createCustomerValidation),
  customersController.create,
);

export { customersRoute };
