import type { CacheKeyType, SetCacheType } from '../../types/cahce.type';
import { logger } from '../logging/logger';
import { redis } from './ioredis.client';

const serviceName = '[Cache Service]';

const setCache = async ({ key, data, ttl = 3000 }: SetCacheType) => {
  logger.info(
    {
      service: serviceName,
      key,
      data,
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

export const cacheService = {
  set: setCache,
  get: getCache,
  del: delCache,
};

export const cacheKey = {
  session: (id?: string) => (id ? `admin:session:${id}` : `admin:session`),
  customers: () => 'admin:customers',
};
