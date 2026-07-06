export type CacheKeyType = {
  key: string;
};

export type SetCacheType = CacheKeyType & {
  data?: Record<string, unknown>;
  ttl?: number;
};
