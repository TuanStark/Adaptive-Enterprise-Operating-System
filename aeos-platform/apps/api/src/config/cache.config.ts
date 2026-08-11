import { registerAs } from '@nestjs/config';

export const cacheConfig = registerAs('cache', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  tls: process.env.REDIS_TLS_ENABLED === 'true',

  keyPrefix: process.env.REDIS_KEY_PREFIX || 'aeos:',

  defaultTtl: parseInt(process.env.CACHE_DEFAULT_TTL || '3600', 10),
  sessionTtl: parseInt(process.env.CACHE_SESSION_TTL || '86400', 10),

  retryAttempts: parseInt(process.env.REDIS_RETRY_ATTEMPTS || '3', 10),
  retryDelayMs: parseInt(process.env.REDIS_RETRY_DELAY_MS || '1000', 10),
}));

export type CacheConfig = ReturnType<typeof cacheConfig>;
