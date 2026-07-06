import type { Request, Response } from 'express';
import { adminsService } from '../services/admins.service';
import { responseSchema } from '../utils/responseServer';
import type { AdminType } from '../types/admins.type';

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
  const id = req.admin?.id;

  const { admin, fromCache } = await adminsService.getAdminLogin(id as string);

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

export const adminsController = {
  register,
  login,
  me,
  logout,
};
