import type multer from 'multer';
import type { Logger } from 'pino';
import type { db } from '../infrastructure/database/drizzle';
import type { admins } from '../infrastructure/database/schemas';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      log?: Logger;
      admin?: typeof admins.$inferSelect;
    }
    interface Express {
      Multer: typeof multer;
    }
  }
}

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
