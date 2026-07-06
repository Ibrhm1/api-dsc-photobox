import { AppError } from '../errors/appError';
import { logger } from '../infrastructure/logging/logger';
import { adminsRepository } from '../repositories/admins.repository';
import type { LoginAdminType, RegisterAdminType } from '../types/admins.type';

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
  const { data: admin, error } = await adminsRepository.login({
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

export const adminsService = {
  registerAdmin,
  loginAdmin,
};
