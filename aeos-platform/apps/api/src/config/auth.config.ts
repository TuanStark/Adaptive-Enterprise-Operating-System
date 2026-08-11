import { registerAs } from '@nestjs/config';

export const authConfig = registerAs('auth', () => ({
  jwt: {
    secret: process.env.JWT_SECRET!,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    issuer: process.env.JWT_ISSUER || 'aeos-platform',
    audience: process.env.JWT_AUDIENCE || 'aeos-api',
  },
  maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
  loginLockDuration: parseInt(process.env.LOGIN_LOCK_DURATION || '900', 10),
}));

export type AuthConfig = ReturnType<typeof authConfig>;
