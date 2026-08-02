// packages/config/src/env.schema.ts
// Zod schema cho environment variables.
// App REFUSE khởi chạy nếu .env thiếu hoặc sai format.

import { z } from 'zod';

export const envSchema = z.object({
  // ── Application ──
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),

  // ── Database ──
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_MIN: z.coerce.number().default(2),
  DATABASE_POOL_MAX: z.coerce.number().default(10),

  // ── Redis ──
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),

  // ── JWT ──
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // ── Logging ──
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // ── Object Storage ──
  S3_ENDPOINT: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_BUCKET: z.string().optional(),

  // ── Email ──
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validate và parse environment variables.
 * Gọi hàm này ở main.ts — nếu thất bại, app dừng ngay.
 */
export function validateEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
  }
  return result.data;
}
