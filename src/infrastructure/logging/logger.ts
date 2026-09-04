import fs from 'fs';
import path from 'path';
import pino from 'pino';
import pinoPretty from 'pino-pretty';
import { env } from '../../utils/env.ts';
import { contextStorage } from './context.ts';

const isDev = env.NODE_ENV === 'development';
const usePretty = isDev && pinoPretty;

const logsDir = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

export const logger = pino({
  level: isDev ? 'debug' : 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  mixin() {
    const store = contextStorage.getStore();
    return store ? { requestId: store.requestId } : {};
  },
  redact: {
    paths: [
      // NPM
      'npm',
      '*.npm',
      'data[*].npm',
      '*[*].npm',
      // Nomor Telepon
      'phoneNumber',
      '*.phoneNumber',
      'data[*].phoneNumber',
      '*[*].phoneNumber',
      //password
      'password',
      '*.password',
      'data[*].password',
      '*[*].password',
      //confirmPassword
      'confirmPassword',
      '*.confirmPassword',
      'data[*].confirmPassword',
      '*[*].confirmPassword',
      // Kredensial
      'token',
    ],
    censor: '[REDACTED]',
  },
  transport: {
    targets: [
      {
        target: 'pino-pretty',
        options: usePretty
          ? {
              colorize: true,
              translateTime: 'HH:MM:ss',
              ignore: 'pid,hostname',
              singleLine: false,
            }
          : { destination: 1 },
        level: isDev ? 'debug' : 'info',
      },
    ],
  },
});
