import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { PrismaService } from '@aeos/database';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return this.getStatus(key, true);
    } catch (error) {
      throw new HealthCheckError(
        `Database health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.getStatus(key, false, { error: error instanceof Error ? error.message : 'Unknown' }),
      );
    }
  }
}
