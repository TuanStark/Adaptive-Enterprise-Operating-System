import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => {
  const host = process.env.DATABASE_HOST || 'localhost';
  const port = parseInt(process.env.DATABASE_PORT || '5432', 10);
  const name = process.env.DATABASE_NAME || 'aeos_dev';
  const user = process.env.DATABASE_USER || 'aeos';
  const password = process.env.DATABASE_PASSWORD || 'aeos_secret';

  const url =
    process.env.DATABASE_URL || `postgresql://${user}:${password}@${host}:${port}/${name}?schema=public`;
  const poolMin = parseInt(process.env.DATABASE_POOL_MIN || '2', 10);
  const poolMax = parseInt(process.env.DATABASE_POOL_MAX || '10', 10);

  return {
    host,
    port,
    name,
    user,
    password,
    url,
    poolMin,
    poolMax,
    connectTimeout: parseInt(process.env.DATABASE_CONNECT_TIMEOUT || '10000', 10),
  };
});

export type DatabaseConfig = ReturnType<typeof databaseConfig>;
