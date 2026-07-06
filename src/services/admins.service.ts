import { AppError } from '../errors/appError';
import crypto from 'crypto';
import { cacheKey, cacheService } from '../infrastructure/cache/cache.service';
import { logger } from '../infrastructure/logging/logger';
import { adminsRepository } from '../repositories/admins.repository';
import type {
  AdminType,
  LoginAdminType,
  RegisterAdminType,
} from '../types/admins.type';

const service = '[Admins Service]';

const registerAdmin = async (data: RegisterAdminType) => {
  logger.info(
    {
      service,
      email: data.email,
    },
    'Proses register admin',
  );

  const isPasswordMatch = data.password === data.confirmPassword;
  if (!isPasswordMatch) {
    logger.warn(
      {
        service,
        email: data.email,
      },
      'Password tidak cocok',
    );
    throw new AppError(400, 'Password tidak cocok');
  }

  const { admin, error } = await adminsRepository.createAdmin(data);
  if (!admin || error) {
    logger.warn(
      {
        service,
        email: data.email,
      },
      'Admin gagal terdaftar',
    );
    throw new AppError(400, 'Admin gagal terdaftar');
  }

  return admin;
};

const loginAdmin = async (data: LoginAdminType) => {
  logger.info(
    {
      service,
      email: data.email,
      lastLogin: data.lastLogin,
    },
    'Proses login admin',
  );

  const date = new Date();
  const { data: admin, error } = await adminsRepository.adminLogin({
    email: data.email,
    password: data.password,
    lastLogin: date,
  });

  if (!admin || !admin.updateLastLoginAdmin || error) {
    logger.warn(
      {
        service,
        email: data.email,
      },
      'Admin gagal login atau tidak terdaftar di database',
    );
    throw new AppError(400, 'Admin gagal login atau tidak terdaftar');
  }

  logger.info(
    {
      service,
      email: admin.session?.user.email,
      lastLogin: admin.updateLastLoginAdmin.lastLogin,
    },
    'Login berhasil',
  );

  return {
    accessToken: admin.session?.access_token,
    ...admin.updateLastLoginAdmin,
  };
};

const getAdminLogin = async (id: string) => {
  logger.info(
    {
      service,
      id,
    },
    'Proses get admin login',
  );

  const cacheKeyAdmin = cacheKey.admin(id);
  const adminCached = (await cacheService.get({
    key: cacheKeyAdmin,
  })) as AdminType;

  if (adminCached) {
    logger.info(
      {
        service,
        email: adminCached.email,
      },
      'Admin login berhasil dari cache',
    );
    return { admin: adminCached, fromCache: true };
  }

  const admin = await adminsRepository.getAdminLogin(id);
  if (!admin) {
    logger.warn(
      {
        service,
        id,
      },
      'Admin tidak ditemukan',
    );
    throw new AppError(404, 'Admin tidak ditemukan');
  }

  await cacheService.set({
    key: cacheKey.admin(id),
    data: admin,
  });

  logger.info(
    {
      service,
      email: admin.email,
    },
    'Get admin login berhasil',
  );

  return { admin, fromCache: false };
};

const logoutAdmin = async (admin: AdminType, token?: string) => {
  logger.info(
    {
      service,
      email: admin.email,
    },
    'Proses logout admin',
  );

  const error = await adminsRepository.adminLogOut();
  if (error) {
    logger.warn(
      {
        service,
      },
      'Admin gagal logout',
    );
    throw new AppError(400, 'Admin gagal logout');
  }

  logger.info(
    {
      service,
    },
    'Logout admin berhasil',
  );
  await cacheService.del({ key: cacheKey.admin(admin.id) });
  if (token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await cacheService.del({ key: `auth:token:${tokenHash}` });
  }
};

export const adminsService = {
  registerAdmin,
  loginAdmin,
  getAdminLogin,
  logoutAdmin,
};
