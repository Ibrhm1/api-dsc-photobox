import { eq, desc } from 'drizzle-orm';
import { db } from '../infrastructure/database/drizzle';
import { photoSessions, photos, customers } from '../infrastructure/database/schemas';
import type {
  InsertPhotoSessionsType,
  UpdateZipUrlPhotoSessionsType,
} from '../types/photoSessions';
import type { Transaction } from '../types/global';

const createPhotoSession = async (
  dataPhotoSession: InsertPhotoSessionsType,
) => {
  const [photoSession] = await db
    .insert(photoSessions)
    .values(dataPhotoSession)
    .returning();
  return photoSession;
};

const findPhotoSessionById = async (id: string) => {
  const [result] = await db
    .select()
    .from(photoSessions)
    .where(eq(photoSessions.id, id))
    .limit(1);
  return result;
};

const updateZipUrlPhotoSession = async (
  data: UpdateZipUrlPhotoSessionsType,
  tx?: Transaction,
) => {
  const query = tx || db;
  const [result] = await query
    .update(photoSessions)
    .set({
      zipUrl: data.zipUrl,
    })
    .where(eq(photoSessions.id, data.id))
    .returning();
  return result;
};

const getGallerySessions = async () => {
  const data = await db
    .select({
      customer: {
        name: customers.name,
      },
      photo: {
        id: photos.id,
        fileName: photos.fileName,
        fileUrl: photos.fileUrl,
      },
      photoSession: {
        id: photoSessions.id,
        createdAt: photoSessions.createdAt,
      },
    })
    .from(photoSessions)
    .leftJoin(photos, eq(photoSessions.id, photos.sessionId))
    .leftJoin(customers, eq(customers.sessionId, photoSessions.id))
    .groupBy(photoSessions.id, customers.id, photos.id)
    .orderBy(desc(photoSessions.createdAt));
  return data;
};

export const photoSessionsRepository = {
  createPhotoSession,
  findPhotoSessionById,
  updateZipUrlPhotoSession,
  getGallerySessions,
};
