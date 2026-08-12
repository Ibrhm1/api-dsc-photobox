import type { Request, Response } from 'express';
import { adminsService } from '../services/admins.service';
import { responseSchema } from '../utils/responseServer';
import type { AdminType } from '../types/admins';

const register = async (req: Request, res: Response) => {
  const admin = await adminsService.registerAdmin(req.body);

  return responseSchema.success({
    res,
    code: 201,
    message: 'Register admin berhasil',
    data: admin,
  });
};

const login = async (req: Request, res: Response) => {
  const admin = await adminsService.loginAdmin(req.body);

  return responseSchema.success({
    res,
    code: 200,
    data: admin,
    message: 'Admin berhasil login',
  });
};

const me = async (req: Request, res: Response) => {
  if (!req.admin) {
  }

  const id = req.admin?.id as string;

  const { admin, fromCache } = await adminsService.getAdminLogin(id);

  return responseSchema.success({
    res,
    code: 200,
    data: admin,
    message: 'Admin berhasil login',
    fromCache,
  });
};

const logout = async (req: Request, res: Response) => {
  const admin = req.admin as AdminType;
  const token = req.headers.authorization?.split(' ')[1];

  await adminsService.logoutAdmin(admin, token);

  return responseSchema.success({
    res,
    code: 200,
    message: 'Admin berhasil logout',
  });
};

const getAllCustomers = async (req: Request, res: Response) => {
  const admin = req.admin as AdminType;
  const email = req.query.email as string;

  const { customers, fromCache } = await adminsService.getAllCustomers(
    admin,
    email,
  );

  return responseSchema.success({
    res,
    code: 200,
    data: customers,
    message: 'Admin berhasil mendapatkan semua customers',
    fromCache,
  });
};

const getAllSessions = async (req: Request, res: Response) => {
  const { sessions, fromCache } =
    await adminsService.getAllSessionWithPhotosWithCustomer();

  return responseSchema.success({
    res,
    code: 200,
    data: sessions,
    message: 'Admin berhasil mendapatkan semua session',
    fromCache,
  });
};

const resetDatabase = async (req: Request, res: Response) => {
  const admin = req.admin as AdminType;
  const pin = req.body.pin;

  const result = await adminsService.resetDatabaseAndStorage(admin, pin);

  return responseSchema.success({
    res,
    code: 200,
    data: result,
    message: 'Admin berhasil mereset database dan storage',
  });
};

export const adminsController = {
  register,
  login,
  me,
  logout,
  getAllCustomers,
  getAllSessions,
  resetDatabase,
};
