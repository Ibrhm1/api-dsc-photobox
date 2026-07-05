import { eq } from 'drizzle-orm';
import { db } from '../infrastructure/database/drizzel';
import { photoSessions } from '../infrastructure/database/schemas';
import type { InsertPhotoSessionsType } from '../types/photoSessions.type';

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

export const photoSessionsRepository = {
  createPhotoSession,
  findPhotoSessionById,
};
