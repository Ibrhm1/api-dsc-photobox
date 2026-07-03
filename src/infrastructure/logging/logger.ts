import pino from 'pino';
import { env } from '../../utils/env';

const isDev = env.NODE_ENV === 'development';

export const logger = pino({
  level: isDev ? 'debug' : 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
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
