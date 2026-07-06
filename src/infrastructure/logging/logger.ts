import pino from 'pino';
import { env } from '../../utils/env';
import { contextStorage } from './context';

const isDev = env.NODE_ENV === 'development';

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
      // Email (Rekomendasi tambahan)
      'email',
      '*.email',
      'data[*].email',
      '*[*].email',
      // Kredensial
      'token',
      'accessToken',
      'refreshToken',
      'password',
      'authorization',
      '*.authorization',
    ],
    censor: '[REDACTED]',
  },

  transport: {
    targets: [
      {
        target: isDev ? 'pino-pretty' : 'pino/file',
        options: isDev
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
          mkdir: true,
        },
        level: 'info',
      },
    ],
  },
});
