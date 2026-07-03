import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../infrastructure/logging/logger';
import { responseSchema } from '../utils/responseServer';
import { AppError } from '../errors/appError';

interface PostgresError extends Error {
  code: string;
  detail?: string;
  hint?: string;
  table_name?: string;
}

export const errorMiddleware = (
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!err) {
    next();
    return;
  }

  // 1. Handle Zod Validation Error
  if (err instanceof ZodError) {
    logger.error(`[ZodError]: ${err.message}`);

    return responseSchema.error({
      res,
      code: 400,
      message: 'Validasi gagal, silakan periksa kembali input Anda',
      errors: err.issues.map((e) => ({ field: e.path[0], message: e.message })),
    });
  }

  // 2. Handle Postgres Error (dari database driver)
  if (err instanceof Error && err.name === 'PostgresError') {
    const pgErr = err as PostgresError;
    logger.error(`[PostgresError (${pgErr.code})]: ${pgErr.message}`);

    // Kode 23505: Unique constraint failed
    if (pgErr.code === '23505') {
      return responseSchema.error({
        res,
        code: 409,
        message: 'Data sudah digunakan!',
        details: pgErr.detail,
      });
    }

    return responseSchema.error({
      res,
      code: 400,
      message: 'Database Error',
      details: pgErr.message,
    });
  }

  // 3. Handle Custom AppError
  if (err instanceof AppError) {
    logger.error(`[AppError]: ${err.message}`);

    return responseSchema.error({
      res,
      code: err.status,
      message: err.message,
    });
  }

  // 4. Default Fallback Error
  logger.error(err, '[ErrorMiddleware]');

  return responseSchema.error({
    res,
    code: 500,
    message: 'Internal Server Error',
  });
};
