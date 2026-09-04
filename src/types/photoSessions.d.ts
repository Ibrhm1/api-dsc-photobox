import type { photoSessions } from '../infrastructure/database/schemas.js';

export type InsertPhotoSessionsType = typeof photoSessions.$inferInsert;

export type UpdateZipUrlPhotoSessionsType = Pick<
  InsertPhotoSessionsType,
  'zipUrl' | 'id'
>;
