import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/appError.js';
import { logger } from '../infrastructure/logging/logger.js';
import { responseSchema } from '../utils/responseServer.js';

interface PostgresErrorLike extends Error {
  code: string;
  detail?: string;
  hint?: string;
  table_name?: string;
  constraint_name?: string;
}

interface HttpLikeError extends Error {
  status?: number;
  statusCode?: number;
  type?: string;
  expose?: boolean;
  cause?: unknown;
}

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const isPostgresErrorLike = (value: unknown): value is PostgresErrorLike => {
  return isObject(value) && typeof value.code === 'string' && value.code.length > 0;
};

const extractPostgresError = (err: unknown): PostgresErrorLike | null => {
  if (isPostgresErrorLike(err)) {
    return err;
  }

  if (isObject(err) && isPostgresErrorLike(err.cause)) {
    return err.cause;
  }

  return null;
};

const isDrizzleError = (err: unknown): boolean => {
  if (!isObject(err)) {
    return false;
  }

  const errorName = typeof err.name === 'string' ? err.name : '';
  return errorName.includes('Drizzle') || extractPostgresError(err) !== null;
};

const getHttpStatusCode = (err: unknown): number | null => {
  if (!isObject(err)) {
    return null;
  }

  const status =
    typeof err.status === 'number'
      ? err.status
      : typeof err.statusCode === 'number'
        ? err.statusCode
        : null;

  if (status && status >= 400 && status <= 599) {
    return status;
  }

  return null;
};

const DRIZZLE_ERROR_MAP: Record<string, { status: number; message: string }> = {
  '23505': {
    status: 409,
    message: 'Data sudah ada (duplikasi).',
  },
  '23503': {
    status: 400,
    message: 'Relasi data tidak valid.',
  },
  '23502': {
    status: 400,
    message: 'Ada field wajib yang belum diisi.',
  },
  '22P02': {
    status: 400,
    message: 'Format input tidak valid.',
  },
};

const isDevelopment = process.env.NODE_ENV === 'development';

const toError = (err: unknown): Error => {
  if (err instanceof Error) {
    return err;
  }

  if (typeof err === 'string') {
    return new Error(err);
  }

  return new Error('Unknown error');
};

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!err) {
    next();
    return;
  }

  // 1. Handle Zod validation error
  if (err instanceof ZodError) {
    logger.error(
      {
        errorName: 'ZodError',
        message: err.message,
        issues: err.issues,
      },
      '[ErrorMiddleware]',
    );

    return responseSchema.error({
      res,
      code: 400,
      message: 'Validasi gagal, silakan periksa kembali input Anda',
      errors: err.issues.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message: issue.message,
      })),
    });
  }

  // 2. Handle Drizzle / Postgres query errors
  if (isDrizzleError(err)) {
    const postgresError = extractPostgresError(err);
    const mappedError = postgresError ? DRIZZLE_ERROR_MAP[postgresError.code] : null;

    logger.error(
      {
        errorName: 'DrizzleError',
        message: toError(err).message,
        code: postgresError?.code,
        detail: postgresError?.detail,
        hint: postgresError?.hint,
        tableName: postgresError?.table_name,
        constraintName: postgresError?.constraint_name,
        stack: toError(err).stack,
      },
      '[ErrorMiddleware]',
    );

    return responseSchema.error({
      res,
      code: mappedError?.status ?? 400,
      message: mappedError?.message ?? 'Terjadi kesalahan query pada database.',
      ...(isDevelopment && postgresError?.detail
        ? { details: postgresError.detail }
        : {}),
    });
  }

  // 3. Handle custom AppError
  if (err instanceof AppError) {
    logger.error(
      {
        errorName: 'AppError',
        status: err.status,
        message: err.message,
        stack: err.stack,
      },
      '[ErrorMiddleware]',
    );

    return responseSchema.error({
      res,
      code: err.status,
      message: err.message,
    });
  }

  // 4. Handle malformed JSON from express.json() / body parser
  const httpStatusCode = getHttpStatusCode(err);
  if (
    httpStatusCode === 400 &&
    isObject(err) &&
    typeof err.type === 'string' &&
    err.type === 'entity.parse.failed'
  ) {
    logger.warn(
      {
        errorName: 'JsonParseError',
        message: toError(err).message,
      },
      '[ErrorMiddleware]',
    );

    return responseSchema.error({
      res,
      code: 400,
      message: 'Format JSON tidak valid.',
    });
  }

  // 5. Handle other HTTP-like errors (status/statusCode)
  if (httpStatusCode) {
    const httpError = toError(err) as HttpLikeError;

    logger.warn(
      {
        errorName: 'HttpLikeError',
        status: httpStatusCode,
        message: httpError.message,
        stack: httpError.stack,
      },
      '[ErrorMiddleware]',
    );

    return responseSchema.error({
      res,
      code: httpStatusCode,
      message: httpError.expose ? httpError.message : 'Terjadi kesalahan pada request.',
      ...(isDevelopment ? { details: httpError.message } : {}),
    });
  }

  // 6. Default fallback
  const unknownError = toError(err);
  logger.error(
    {
      errorName: 'UnknownError',
      message: unknownError.message,
      stack: unknownError.stack,
    },
    '[ErrorMiddleware]',
  );

  return responseSchema.error({
    res,
    code: 500,
    message: 'Internal Server Error',
    ...(isDevelopment ? { details: unknownError.message } : {}),
  });
};
