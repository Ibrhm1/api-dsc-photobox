export type CacheKeyType = {
  key: string;
};

export type SetCacheType = CacheKeyType & {
  data: Record<string, any>;
  ttl?: number;
};
