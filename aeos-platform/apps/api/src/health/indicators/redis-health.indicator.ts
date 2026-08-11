import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);

    let client: RedisClientType | undefined;

    try {
      client = createClient({
        socket: {
          host,
          port,
          connectTimeout: 3000,
        },
        password: process.env.REDIS_PASSWORD || undefined,
      }) as RedisClientType;

      await client.connect();
      const pong = await client.ping();

      if (pong !== 'PONG') {
        throw new Error(`Redis PING returned: ${pong}`);
      }

      return this.getStatus(key, true);
    } catch (error) {
      throw new HealthCheckError(
        `Redis health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.getStatus(key, false, { error: error instanceof Error ? error.message : 'Unknown' }),
      );
    } finally {
      if (client?.isOpen) {
        await client.quit().catch(() => { });
      }
    }
  }
}
