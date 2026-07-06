import type { Request, Response } from 'express';
import { adminsService } from '../services/admins.service';
import { responseSchema } from '../utils/responseServer';

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

export const adminsController = {
  register,
  login,
};
