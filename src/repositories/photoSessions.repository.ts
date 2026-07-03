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

export const photoSessionsRepository = {
  createPhotoSession,
};
