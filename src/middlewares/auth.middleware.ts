import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import type { NextFunction, Request, Response } from 'express';
import { cacheService } from '../infrastructure/cache/cache.service';
import { db } from '../infrastructure/database/drizzle';
import { admins } from '../infrastructure/database/schemas';
import { supabase } from '../infrastructure/database/supabase';
import { logger } from '../infrastructure/logging/logger';
import { responseSchema } from '../utils/responseServer';

const middlewareName = '[Auth Middleware]';

// Fungsi pembantu untuk hash token agar key Redis tidak terlalu panjang
const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
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

    const tokenHash = hashToken(token);
    const cacheKeyToken = `auth:token:${tokenHash}`;

    // 1. Cek apakah userId token ini ada di cache Redis
    const cachedToken = await cacheService.get<{ userId: string }>({
      key: cacheKeyToken,
    });
    let userId = cachedToken?.userId;

    if (userId) {
      // Cache HIT: Token valid & langsung gunakan userId dari Redis
      logger.debug(
        {
          service: middlewareName,
        },
        'Verifikasi token berhasil (dari Cache Redis)',
      );
    } else {
      // Cache MISS: Tanya ke Supabase
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(token);

      if (authError || !user) {
        logger.warn(
          {
            service: middlewareName,
            error: authError?.message,
          },
          'Verifikasi token Supabase gagal (kemungkinan sudah logout/expired)',
        );
        responseSchema.error({
          res,
          code: 401,
          message: 'Sesi telah berakhir, silakan login kembali',
        });
        return;
      }

      userId = user.id;

      // 2. Simpan userId ke Redis dengan TTL 2 menit (120 detik)
      await cacheService.set({
        key: cacheKeyToken,
        data: { userId },
        ttl: 120, // 2 menit
      });
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
          userId,
        },
        'Admin dengan ID tersebut tidak terdaftar di database',
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
        error: err.message,
      },
      'Kesalahan sistem pada Auth Middleware',
    );
    responseSchema.error({
      res,
      code: 500,
      message: 'Terjadi kesalahan server internal',
    });
    return;
  }
};
