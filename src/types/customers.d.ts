import type { customers } from '../infrastructure/database/schemas.ts';

export type InsertCustomersType = typeof customers.$inferInsert;
