import { z } from 'zod';

const createPhotosValidation = z.object({
  sessionId: z
    .string('Session ID harus berupa string')
    .min(1, 'Session ID wajib diisi'),
  files: z.any().refine((file: Express.Multer.File[]) => {
    if (file.length > 10) {
      return false;
    }
    return true;
  }),
});

export const photosValidation = {
  createPhotos: createPhotosValidation,
};
