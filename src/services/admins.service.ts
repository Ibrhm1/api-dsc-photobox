import { generateZipPhotos } from '../storage/zip.service.js';
import crypto from 'crypto';
import { AppError } from '../errors/appError.js';
import {
  cacheKey,
  cacheService,
} from '../infrastructure/cache/cache.service.js';
import { logger } from '../infrastructure/logging/logger.js';
import { adminsRepository } from '../repositories/admins.repository.js';
import storageService from '../storage/storage.service.js';
import type {
  AdminType,
  LoginAdminType,
  RegisterAdminType,
} from '../types/admins.js';
import { env } from '../utils/env.js';

const service = '[Admins Service]';

const requirePin = (pin: string, email: string) => {
  const isPinMatch = pin === env.PIN;
  if (!isPinMatch) {
    logger.warn({ service, email }, 'PIN tidak cocok');
    throw new AppError(400, 'PIN tidak cocok');
  }
};

const registerAdmin = async (data: RegisterAdminType) => {
  logger.info({ service, email: data.email }, 'Proses register admin');

  const isPasswordMatch = data.password === data.confirmPassword;
  if (!isPasswordMatch) {
    logger.warn({ service, email: data.email }, 'Password tidak cocok');
    throw new AppError(400, 'Password tidak cocok');
  }

  const { admin, error } = await adminsRepository.createAdmin(data);
  if (!admin || error) {
    logger.warn({ service, email: data.email }, 'Admin gagal terdaftar');
    throw new AppError(400, 'Admin gagal terdaftar');
  }

  return admin;
};

const loginAdmin = async (data: LoginAdminType) => {
  logger.info(
    { service, email: data.email, lastLogin: data.lastLogin },
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
      { service, email: data.email },
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
  logger.info({ service }, 'Proses mengambil data admin');

  const cacheKeyAdmin = cacheKey.admin(id);
  const adminCached = (await cacheService.get({
    key: cacheKeyAdmin,
  })) as AdminType;
  if (adminCached) {
    logger.info(
      { service, ...adminCached },
      'Berhasil mengambil data admin dari cache',
    );
    return { admin: adminCached, fromCache: true };
  }

  const admin = await adminsRepository.getAdminLogin(id);
  if (!admin) {
    logger.warn({ service }, 'Gagal mendapatkan data admin');
    throw new AppError(404, 'Gagal mendapatkan data admin');
  }

  await cacheService.set({
    key: cacheKey.admin(id),
    data: admin,
  });

  logger.info({ service, ...admin }, 'Admin berhasil mendapatkan data dirinya');

  return { admin, fromCache: false };
};

const logoutAdmin = async (admin: AdminType, token?: string) => {
  logger.info({ service, email: admin.email }, 'Proses logout admin');

  const error = await adminsRepository.adminLogOut();
  if (error) {
    logger.warn({ service, email: admin.email }, 'Admin gagal logout');
    throw new AppError(400, 'Admin gagal logout');
  }

  logger.info({ service, email: admin.email }, 'Logout admin berhasil');

  await cacheService.del({ key: cacheKey.admin(admin.id) });

  if (token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await cacheService.del({ key: cacheKey.authToken(tokenHash) });
  }

  return;
};

const getAllCustomers = async (admin: AdminType, email?: string) => {
  logger.info(
    { service, ...admin, ...(email && { customer: email }) },
    'Proses mengambil semua customers',
  );

  const cacheKeyAllCustomer = cacheKey.customers();

  if (!email) {
    const customersCached = await cacheService.get({
      key: cacheKeyAllCustomer,
    });
    if (customersCached) {
      logger.info(
        { service, ...admin },
        'Berhasil mengambil customer dalam cahce',
      );
      return { customers: customersCached, fromCache: true };
    }
  }

  const customers = await adminsRepository.getAllCustomers(email);
  if (!customers || customers.length === 0) {
    logger.warn({ service }, 'Gagal mendapatkan semua customers');
    throw new AppError(400, 'Gagal mendapatkan semua customers');
  }

  if (!email) {
    await cacheService.set({
      key: cacheKeyAllCustomer,
      data: customers,
      ttl: 300,
    });
  }

  logger.info(
    { service, count: customers.length },
    'Berhasil mendapatkan semua customers',
  );

  return { customers, fromCache: false };
};

const getAllSessionWithPhotosWithCustomer = async () => {
  logger.info({ service }, 'Proses mengambil semua data session');

  const cacheKeyAllSession = cacheKey.session();
  const cachedAllSession = await cacheService.get({ key: cacheKeyAllSession });
  if (cachedAllSession) {
    logger.info(
      { service, ...cachedAllSession },
      'Berhasil mengambil semua data session dari cache',
    );
    return { sessions: cachedAllSession, fromCache: true };
  }

  const allSessions = await adminsRepository.getAllSession();
  if (!allSessions) {
    logger.warn({ service }, 'Gagal mendapatkan semua session');
    throw new AppError(400, 'Gagal mendapatkan semua session');
  }

  const groupedData = allSessions.reduce<Record<string, any>>((acc, row) => {
    const sessionId = row.photoSession.id;

    if (!acc[sessionId]) {
      acc[sessionId] = {
        photoSession: row.photoSession,
        customer: row.customer,
        photos: [],
      };
    }

    if (row.photo) {
      acc[sessionId].photos.push(row.photo);
    }

    return acc;
  }, {});

  const groupedSessions = Object.values(groupedData);

  await cacheService.set({
    key: cacheKeyAllSession,
    data: groupedSessions,
    ttl: 300,
  });

  logger.info(
    { service, count: groupedSessions.length },
    'Berhasil mendapatkan semua session',
  );

  return { sessions: groupedSessions, fromCache: false };
};

const resetDatabaseAndStorage = async (admin: AdminType, pin: string) => {
  logger.info({ service, admin }, 'Proses reset database dan storage');

  requirePin(pin, admin.email);

  const allSession = await adminsRepository.getAllSession();

  await Promise.all(
    allSession.map(async (session) => {
      await storageService.deleteSessionFiles(session.photoSession.id);
    }),
  );

  const resetDatabaseResult = await adminsRepository.resetDatabase();

  await cacheService.flush();

  logger.info({ service, admin }, 'Berhasil reset database dan storage');

  return {
    database: resetDatabaseResult,
  };
};

const exportAllFolderInBucket = async (pin: string, admin: AdminType) => {
  logger.info(
    { service, admin: admin.email },
    'Proses export semua folder di bucket',
  );

  requirePin(pin, admin.email);

  const { validFiles, filePaths } =
    await storageService.downloadAllFilesFromBucket();

  const zipBuffer = await generateZipPhotos(validFiles);

  await storageService.deleteBucketFiles(filePaths);

  // await adminsRepository.resetDatabase();
  await cacheService.flush();

  logger.info(
    { service, admin: admin.email, fileCount: validFiles.length },
    'Berhasil mengekspor dan menghapus semua data di bucket dan database',
  );

  return {
    filename: `export-dsc-photobox-${Date.now()}.zip`,
    buffer: zipBuffer,
  };
};

export const adminsService = {
  registerAdmin,
  loginAdmin,
  getAdminLogin,
  logoutAdmin,
  getAllCustomers,
  getAllSessionWithPhotosWithCustomer,
  resetDatabaseAndStorage,
  exportAllFolderInBucket,
};
