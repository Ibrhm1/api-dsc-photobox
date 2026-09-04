import type { customers } from '../infrastructure/database/schemas.js';

export type InsertCustomersType = typeof customers.$inferInsert;
