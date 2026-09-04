import { photos } from '../infrastructure/database/schemas.js';

export type PhotosType = typeof photos.$inferInsert;

export type CreatePhotosType = Pick<PhotosType, 'sessionId'> & {
  files: Express.Multer.File[];
};
