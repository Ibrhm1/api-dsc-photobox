import type { Request } from 'express';
import multer, { type FileFilterCallback } from 'multer';
import { AppError } from '../errors/appError';

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(400, 'Hanya file gambar yang diizinkan.'));
  }
};

export const uploadFiles = (fieldName: string) => {
  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 1024 * 1024 * 3, // 3MB
    },
  }).array(fieldName, 20);
};
