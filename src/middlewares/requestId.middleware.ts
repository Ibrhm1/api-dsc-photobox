import type { NextFunction, Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { contextStorage } from '../infrastructure/logging/context.ts';
import { logger } from '../infrastructure/logging/logger.ts';

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestId = req.header('x-request-id') || nanoid(10);

  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  req.log = logger.child({ requestId });

  contextStorage.run({ requestId }, () => {
    next();
  });
};
