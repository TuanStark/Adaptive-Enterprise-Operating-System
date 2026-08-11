// packages/config/src/env.schema.ts
// Zod schema cho environment variables.
// App REFUSE khởi chạy nếu .env thiếu hoặc sai format.
// Design: Hỗ trợ cả DATABASE_URL (local dev) lẫn component vars (K8s inject từng biến).

import { z } from 'zod';

export const envSchema = z
  .object({
    // ── Application ──
    NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
    PORT: z.coerce.number().default(3000),

    // ── Database (hỗ trợ 2 cách) ──
    // Cách 1: DATABASE_URL trực tiếp (local dev, docker-compose)
    // Cách 2: Component vars (K8s — Secrets Manager inject từng biến)
    DATABASE_URL: z.string().optional(),
    DATABASE_HOST: z.string().optional(),
    DATABASE_PORT: z.coerce.number().default(5432),
    DATABASE_NAME: z.string().optional(),
    DATABASE_USER: z.string().optional(),
    DATABASE_PASSWORD: z.string().optional(),
    DATABASE_POOL_MIN: z.coerce.number().default(2),
    DATABASE_POOL_MAX: z.coerce.number().default(10),

    // ── Redis ──
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.coerce.number().default(6379),
    REDIS_PASSWORD: z.string().optional(),
    REDIS_TLS_ENABLED: z
      .string()
      .transform((val) => val === 'true')
      .default('false'),

    // ── JWT ──
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_ACCESS_EXPIRY: z.string().default('15m'),
    JWT_REFRESH_EXPIRY: z.string().default('7d'),

    // ── Logging ──
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

    // ── Object Storage (S3 / MinIO / Cloudinary) ──
    S3_ENDPOINT: z.string().optional(),
    S3_ACCESS_KEY: z.string().optional(),
    S3_SECRET_KEY: z.string().optional(),
    S3_BUCKET: z.string().optional(),
    S3_REGION: z.string().default('ap-southeast-1'),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),

    // ── Email (SMTP) ──
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_SECURE: z
      .string()
      .transform((val) => val === 'true')
      .default('false'),
    MAIL_FROM: z.string().default('AEOS Platform <noreply@aeos.com>'),

    // ── Frontend ──
    FRONTEND_URL: z.string().default('http://localhost:3001'),
    CORS_ORIGINS: z.string().optional(), // Comma-separated, overrides default
  })
  .superRefine((data, ctx) => {
    // Validation: Phải có DATABASE_URL hoặc đủ component vars
    const hasUrl = !!data.DATABASE_URL;
    const hasComponents =
      !!data.DATABASE_HOST && !!data.DATABASE_NAME && !!data.DATABASE_USER && !!data.DATABASE_PASSWORD;

    if (!hasUrl && !hasComponents) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Database config required: provide DATABASE_URL or all of DATABASE_HOST, DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD',
        path: ['DATABASE_URL'],
      });
    }
  });

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Xây dựng DATABASE_URL từ component vars (cho K8s).
 * Ưu tiên DATABASE_URL nếu đã có (backward compatible với local dev).
 */
export function buildDatabaseUrl(config: EnvConfig): string {
  if (config.DATABASE_URL) {
    return config.DATABASE_URL;
  }
  const { DATABASE_USER, DATABASE_PASSWORD, DATABASE_HOST, DATABASE_PORT, DATABASE_NAME } = config;
  return `postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}?schema=public`;
}

/**
 * Validate và parse environment variables.
 * Gọi hàm này ở main.ts — nếu thất bại, app dừng ngay.
 * Sử dụng structured output để Loki/CloudWatch có thể parse.
 */
export function validateEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    // Production: JSON error output cho log aggregation
    // Development: human-readable
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
      console.error(
        JSON.stringify({
          level: 'fatal',
          service: 'aeos-api',
          message: 'Invalid environment variables',
          errors: result.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
          timestamp: new Date().toISOString(),
        }),
      );
    } else {
      console.error('❌ Invalid environment variables:');
      console.error(JSON.stringify(result.error.format(), null, 2));
    }
    process.exit(1);
  }
  return result.data;
}
