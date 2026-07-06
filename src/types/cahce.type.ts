export type CacheKeyType = {
  key: string;
};

export type SetCacheType = CacheKeyType & {
  data?: unknown;
  ttl?: number;
};
