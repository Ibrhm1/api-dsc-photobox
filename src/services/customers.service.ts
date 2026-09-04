import { AppError } from '../errors/appError.js';
import { logger } from '../infrastructure/logging/logger.js';
import { customersRepository } from '../repositories/customers.repository.js';
import { photoSessionsRepository } from '../repositories/photoSessions.repository.js';
import type { InsertCustomersType } from '../types/customers.js';
import { sendMailToCustomer } from './email.service.js';

const serviceName = '[Customers Service]';

const createCustomerBySessionId = async (payload: InsertCustomersType) => {
  logger.info(
    {
      service: serviceName,
      sessionId: payload.sessionId,
      email: payload.email,
    },
    'Mulai proses pembuatan data customer',
  );

  const isExistPhotoSession =
    await photoSessionsRepository.findPhotoSessionById(payload.sessionId);

  if (!isExistPhotoSession) {
    logger.warn(
      {
        service: serviceName,
        sessionId: payload.sessionId,
        photoSession: isExistPhotoSession,
        email: payload.email,
      },
      'Photo session tidak ditemukan',
    );
    throw new AppError(404, `Photo session tidak ditemukan`);
  }

  const customer = await customersRepository.createCustomer(payload);

  if (!customer) {
    logger.warn(
      {
        service: serviceName,
        sessionId: payload.sessionId,
        photoSession: isExistPhotoSession,
        email: payload.email,
      },
      'Customer gagal dibuat',
    );
    throw new AppError(400, `Gagal menambahkan data customer`);
  }

  //* Send Email
  sendMailToCustomer({
    name: customer.name,
    email: customer.email,
    zipUrl: isExistPhotoSession.zipUrl || '',
  });

  return customer;
};

export const customersService = {
  createCustomerBySessionId,
};
