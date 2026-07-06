import { eq } from 'drizzle-orm';
import { db } from '../infrastructure/database/drizzle';
import { photoSessions } from '../infrastructure/database/schemas';
import type {
  InsertPhotoSessionsType,
  UpdateZipUrlPhotoSessionsType,
} from '../types/photoSessions.type';
import type { Transaction } from '../types/global.type';

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

export const photoSessionsRepository = {
  createPhotoSession,
  findPhotoSessionById,
  updateZipUrlPhotoSession,
};
