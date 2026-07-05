import type { Request, Response } from 'express';
import { customersService } from '../services/customers.service';
import type { InsertCustomersType } from '../types/customers.type';
import { responseSchema } from '../utils/responseServer';

const create = async (req: Request, res: Response) => {
  const { name, email, instagramUsername, phoneNumber, npm, major } = req.body;
  const { sessionId } = req.params as { sessionId: string };

  const payload: InsertCustomersType = {
    name,
    sessionId,
    email,
    instagramUsername,
    phoneNumber,
    npm,
    major,
  };

  const customer = await customersService.createCustomerBySessionId(payload);

  return responseSchema.success({
    res,
    code: 201,
    message: 'Data berhasil ditambahkan',
    data: customer,
  });
};

const getAll = async (req: Request, res: Response) => {
  const customersData = await customersService.getAllDataCustomers();

  return responseSchema.success({
    res,
    code: 200,
    message: 'Data berhasil diambil',
    data: customersData,
  });
};

export const customersController = {
  create,
  getAll,
};
