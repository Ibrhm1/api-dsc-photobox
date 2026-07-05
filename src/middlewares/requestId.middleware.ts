import type { NextFunction, Request, Response } from 'express';
import { logger } from '../infrastructure/logging/logger';
import { contextStorage } from '../infrastructure/logging/context';
import { nanoid } from 'nanoid';

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
