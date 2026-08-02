// apps/api/src/health/health.controller.ts
// Health Check endpoints cho Kubernetes liveness/readiness probes.

import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, MemoryHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
  ) {}

  /** Liveness probe — Ứng dụng có đang chạy? */
  @Get('liveness')
  @HealthCheck()
  liveness() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024), // 200MB
    ]);
  }

  /**
   * Readiness probe — Ứng dụng sẵn sàng nhận request?
   * TODO: Thêm DB + Redis health check sau Phase 3.2
   */
  @Get('readiness')
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024),
      // () => this.db.pingCheck('database'),
      // () => this.redis.pingCheck('redis'),
    ]);
  }
}
