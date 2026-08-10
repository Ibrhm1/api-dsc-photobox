import type { customers } from '../infrastructure/database/schemas';

export type InsertCustomersType = typeof customers.$inferInsert;
