import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../infrastructure/database/drizzle';
import { admins } from '../infrastructure/database/schemas';
import { logger } from '../infrastructure/logging/logger';
import { env } from '../utils/env';
import { responseSchema } from '../utils/responseServer';

const middlewareName = '[Auth Middleware]';

const decodeToken = (
  res: Response,
  token: string,
): string | undefined | void => {
  try {
    const decoded = jwt.verify(token, env.SUPABASE_JWT_SECRET, {
      algorithms: ['HS256'],
    }) as jwt.JwtPayload;

    if (!decoded.sub) {
      logger.warn(
        {
          service: middlewareName,
        },
        'Token tidak memiliki subject (sub)',
      );
      responseSchema.error({
        res,
        code: 401,
        message: 'Token tidak valid',
      });
      return;
    }

    return decoded.sub;
  } catch (error) {
    const err = error as Error;
    logger.warn(
      {
        service: middlewareName,
        message: err.message,
      },
      'Verifikasi token gagal',
    );
    responseSchema.error({
      res,
      code: 401,
      message: 'Token tidak valid atau kedaluwarsa',
    });
    return;
  }
};

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn(
        {
          service: middlewareName,
          header: authHeader,
        },
        'Otorisasi salah atau tidak ada token',
      );
      responseSchema.error({
        res,
        code: 401,
        message: 'Token tidak ditemukan',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      logger.warn(
        {
          service: middlewareName,
        },
        'Token salah/kosong',
      );
      responseSchema.error({
        res,
        code: 401,
        message: 'Token tidak valid',
      });
      return;
    }

    const userId = decodeToken(res, token);
    if (!userId) {
      return;
    }

    const [dbAdmin] = await db
      .select()
      .from(admins)
      .where(eq(admins.id, userId))
      .limit(1);

    if (!dbAdmin) {
      logger.warn(
        {
          service: middlewareName,
          adminId: userId,
        },
        'Admin tidak terdaftar di database',
      );
      responseSchema.error({
        res,
        code: 404,
        message: 'Admin tidak terdaftar',
      });
      return;
    }

    req.admin = dbAdmin;
    next();
  } catch (error) {
    const err = error as Error;
    logger.error(
      {
        service: middlewareName,
        ...err,
      },
      'Terjadi kesalahan server internal',
    );
    responseSchema.error({
      res,
      code: 500,
      message: 'Terjadi kesalahan server internal',
    });
    return;
  }
};
