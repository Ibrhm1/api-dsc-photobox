import type { CacheKeyType, SetCacheType } from '../../types/cache.d.ts';
import { logger } from '../logging/logger.ts';
import { redis } from './ioredis.client.ts';

const serviceName = '[Cache Service]';

const setCache = async ({ key, data, ttl = 3000 }: SetCacheType) => {
  logger.info(
    {
      service: serviceName,
      key,
      ...data,
      ttl,
    },
    'SET DATA',
  );
  return await redis.setex(key, ttl, JSON.stringify(data));
};

const getCache = async <T>({ key }: CacheKeyType): Promise<T | null> => {
  logger.info(
    {
      service: serviceName,
      key,
    },
    'GET DATA',
  );
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data);
};

const delCache = async ({ key }: CacheKeyType) => {
  logger.info(
    {
      service: serviceName,
      key,
    },
    'DEL DATA',
  );
  return await redis.del(key);
};

const flushCache = async () => {
  logger.info(
    {
      service: serviceName,
    },
    'FLUSH DATA',
  );
  return await redis.flushdb();
};

export const cacheService = {
  set: setCache,
  get: getCache,
  del: delCache,
  flush: flushCache,
};

export const cacheKey = {
  admin: (id: string) => `admin:${id}`,
  authToken: (tokenHash: string) => `auth:token:${tokenHash}`,
  customers: () => 'admin:customers',
  session: (id?: string) => (id ? `admin:session:${id}` : `admin:session`),
  photos: (sessionId: string) => `photos:session:${sessionId}`,
};
