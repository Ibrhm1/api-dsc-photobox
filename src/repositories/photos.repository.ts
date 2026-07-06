import { db } from '../infrastructure/database/drizzle';
import { photos } from '../infrastructure/database/schemas';
import type { Transaction } from '../types/global.type';
import type { PhotosType } from '../types/photos.type';

const createPhotos = async (data: PhotosType, tx?: Transaction) => {
  const query = tx || db;
  const [result] = await query
    .insert(photos)
    .values([data])
    .onConflictDoNothing()
    .returning();
  return result;
};

export const photosRepository = {
  createPhotos,
};
