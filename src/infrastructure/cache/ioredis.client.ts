import { Redis } from 'ioredis';
import { env } from '../../utils/env.ts';
import { logger } from '../logging/logger.ts';

const serviceName = '[IoRedis Client]';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redis.on('ready', () => {
  logger.info(
    {
      service: serviceName,
    },
    'Redis berhasil terkoneksi',
  );
});

redis.on('error', (err) => {
  logger.error(
    {
      service: serviceName,
      err,
    },
    'Redis error',
  );
});

redis.on('reconnecting', () => {
  logger.warn(
    {
      service: serviceName,
    },
    'Redis mencoba terkoneksi kembali',
  );
});

process.on('SIGINT', () => {
  redis.quit();
  logger.info(
    {
      service: serviceName,
    },
    'Redis terputus',
  );
  process.exit(0);
});
