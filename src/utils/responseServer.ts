import type { Response } from "express";
import { contextStorage } from "../infrastructure/logging/context";

type ResponseParamsType = {
  res: Response;
  code: number;
  message: string;
  fromCache?: boolean;
  errors?: unknown[];
  details?: string;
  data?: unknown;
};

const success = ({
  res,
  code,
  message,
  data,
  fromCache = false,
}: ResponseParamsType) => {
  res.setHeader('X-Data-Source', fromCache ? 'cache' : 'database');

  return res.status(code).json({
    message,
    data,
  });
};

const error = ({ res, code, message, details, errors }: ResponseParamsType) => {
  const store = contextStorage.getStore();

  return res.status(code).json({
    message,
    ...(store?.requestId && { requestId: store.requestId }),
    ...(errors && { errors }),
    ...(details && { details }),
  });
};

export const responseSchema = {
  success,
  error,
};
