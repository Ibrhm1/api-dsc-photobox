import type multer from 'multer';
import type { Logger } from 'pino';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      log?: Logger;
    }
    interface Express {
      Multer: typeof multer;
    }
  }
}
