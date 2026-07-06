import type { Request, Response } from 'express';
import { photosService } from '../services/photos.service';
import type { CreatePhotosType } from '../types/photos.type';
import { responseSchema } from '../utils/responseServer';

const create = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const files = req.files;

  const data: CreatePhotosType = {
    files: files as Express.Multer.File[],
    sessionId: sessionId as string,
  };

  const photos = await photosService.uploadPhotos(data);

  return responseSchema.success({
    res,
    code: 201,
    data: photos,
    message: 'Berhasil upload photos',
  });
};

const getAll = async (req: Request, res: Response) => {
  const { sessionId } = req.params;

  const { photos, fromCache } = await photosService.getAllPhotosBySessionId(
    sessionId as string,
  );

  return responseSchema.success({
    res,
    code: 200,
    data: photos,
    message: 'Berhasil mendapatkan photos',
    fromCache,
  });
};

export const photosController = {
  create,
  getAll,
};
