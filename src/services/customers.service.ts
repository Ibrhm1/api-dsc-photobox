import { AppError } from '../errors/appError.ts';
import { logger } from '../infrastructure/logging/logger.ts';
import { customersRepository } from '../repositories/customers.repository.ts';
import { photoSessionsRepository } from '../repositories/photoSessions.repository.ts';
import type { InsertCustomersType } from '../types/customers.d.ts';
import { sendMailToCustomer } from './email.service.ts';

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
