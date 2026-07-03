import type { NextFunction, Request, Response } from 'express';
import { logger } from '../infrastructure/logging/logger';
import { responseSchema } from '../utils/responseServer';

export const notFoundMiddleware = (
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  logger.error(`[NotFoundError]: Endpoint tidak ditemukan`);

  return responseSchema.error({
    res,
    code: 404,
    message: 'Endpoint tidak ditemukan',
  });
};
