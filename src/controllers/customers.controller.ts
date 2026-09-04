import type { Request, Response } from 'express';
import { customersService } from '../services/customers.service.js';
import { responseSchema } from '../utils/responseServer.js';

const create = async (req: Request, res: Response) => {
  const { name, email, instagramUsername, phoneNumber, npm, major } = req.body;
  const { sessionId } = req.params;

  const customer = await customersService.createCustomerBySessionId({
    name,
    sessionId: sessionId as string,
    email,
    instagramUsername,
    phoneNumber,
    npm,
    major,
  });

  return responseSchema.success({
    res,
    code: 201,
    message: 'Data berhasil ditambahkan',
    data: customer,
  });
};

export const customersController = {
  create,
};
