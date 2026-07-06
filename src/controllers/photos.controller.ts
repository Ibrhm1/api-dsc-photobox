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

export const photosController = {
  create,
};
