import type { Request, Response } from 'express';
import { photoSessionsService } from '../services/photoSessions.service';
import { responseSchema } from '../utils/responseServer';

const create = async (req: Request, res: Response) => {
  const photoSession = await photoSessionsService.createNewPhotoSession();

  return responseSchema.success({
    res,
    code: 201,
    data: photoSession,
    message: 'Berhasil menambahkan photo session',
  });
};

export const photoSessionsController = {
  create,
};
