import { Router } from 'express';
import {
  validateBody,
  validateParams,
} from '../middlewares/validation.middleware';
import { customersValidation } from '../validations/customers.validation';
import { customersController } from '../controllers/customers.controller';

const customersRoute = Router();

customersRoute.post(
  '/:sessionId',
  validateParams(customersValidation.queryParamsCustomerValidation),
  validateBody(customersValidation.createCustomerValidation),
  customersController.create,
);
customersRoute.get('/', customersController.getAll);

export { customersRoute };
