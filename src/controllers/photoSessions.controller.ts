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

const getGallery = async (req: Request, res: Response) => {
  const { sessions, fromCache } = await photoSessionsService.getPublicGallerySessions();

  return responseSchema.success({
    res,
    code: 200,
    data: sessions,
    message: 'Berhasil mendapatkan gallery photo sessions',
    fromCache,
  });
};

export const photoSessionsController = {
  create,
  getGallery,
};
