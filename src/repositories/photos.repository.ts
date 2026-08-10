import { desc, eq } from 'drizzle-orm';
import { db } from '../infrastructure/database/drizzle';
import {
  customers,
  photos,
  photoSessions,
} from '../infrastructure/database/schemas';
import type { Transaction } from '../types/global';
import type { PhotosType } from '../types/photos';

const createPhotos = async (data: PhotosType, tx?: Transaction) => {
  const query = tx || db;
  const [result] = await query
    .insert(photos)
    .values([data])
    .onConflictDoNothing()
    .returning();
  return result;
};

const getPhotosBySessionId = async (sessionId: string) => {
  const result = await db
    .select({
      photos: {
        id: photos.id,
        fileName: photos.fileName,
        fileUrl: photos.fileUrl,
      },
      customers: {
        id: customers.id,
        name: customers.name,
        email: customers.email,
        npm: customers.npm,
        major: customers.major,
        phoneNumber: customers.phoneNumber,
        instragram: customers.instagramUsername,
      },
    })
    .from(photos)
    .where(eq(photos.sessionId, sessionId))
    .orderBy(desc(photos.createdAt))
    .innerJoin(customers, eq(customers.sessionId, sessionId));

  return result;
};

export const photosRepository = {
  createPhotos,
  getPhotosBySessionId,
};
