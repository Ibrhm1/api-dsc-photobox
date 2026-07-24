import fs from 'fs';
import path from 'path';
import pino from 'pino';
import { env } from '../../utils/env';
import { contextStorage } from './context';

const isDev = env.NODE_ENV === 'development';

let hasPinoPretty = false;
try {
  require.resolve('pino-pretty');
  hasPinoPretty = true;
} catch {
  hasPinoPretty = false;
}
const usePretty = isDev && hasPinoPretty;

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
        target: usePretty ? 'pino-pretty' : 'pino/file',
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
      {
        target: 'pino/file',
        options: {
          destination: './logs/app.log',
          mkdir: false, // Di-set ke false karena folder logs sudah dibuat di atas secara aman
        },
        level: 'info',
      },
    ],
  },
});
