// apps/api/src/health/health.controller.ts
// Production-grade health checks cho Kubernetes.
//
// K8s probes mapping:
// ┌────────────┬─────────────────┬──────────────────────────────────────────┐
// │ K8s Probe  │ Endpoint        │ Kiểm tra gì                             │
// ├────────────┼─────────────────┼──────────────────────────────────────────┤
// │ startup    │ /health/startup │ App đã boot xong (Prisma connected)      │
// │ liveness   │ /health/liveness│ App còn sống (memory, deadlock)          │
// │ readiness  │ /health/readiness│ App sẵn sàng nhận traffic (DB + Redis) │
// └────────────┴─────────────────┴──────────────────────────────────────────┘
//
// QUAN TRỌNG:
// - startup probe: cho phép Prisma cold start (5-15s) mà không bị K8s kill
// - liveness: KHÔNG check external deps (DB down ≠ app dead, chỉ cần restart DB)
// - readiness: CHECK tất cả deps (nếu DB down, ngưng gửi traffic đến pod này)

import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, MemoryHealthIndicator } from '@nestjs/terminus';
import { PrismaHealthIndicator } from './indicators/prisma-health.indicator';
import { RedisHealthIndicator } from './indicators/redis-health.indicator';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly redisHealth: RedisHealthIndicator,
  ) {}

  /**
   * STARTUP PROBE
   * K8s config: failureThreshold=30, periodSeconds=5 (→ cho phép 150s boot)
   * Chỉ check 1 lần khi pod khởi động — Prisma cần thời gian connect.
   * Sau khi pass, K8s chuyển sang liveness + readiness probes.
   */
  @Get('startup')
  @HealthCheck()
  startup() {
    return this.health.check([() => this.prismaHealth.isHealthy('database')]);
  }

  /**
   * LIVENESS PROBE
   * K8s config: periodSeconds=15, failureThreshold=3, timeoutSeconds=5
   * KHÔNG check external dependencies.
   * Nếu fail → K8s restart pod (có thể app bị memory leak, deadlock).
   */
  @Get('liveness')
  @HealthCheck()
  liveness() {
    return this.health.check([
      // 300MB heap limit — nếu vượt, app có thể bị memory leak
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
    ]);
  }

  /**
   * READINESS PROBE
   * K8s config: periodSeconds=10, failureThreshold=3, timeoutSeconds=5
   * CHECK tất cả dependencies.
   * Nếu fail → K8s ngưng gửi traffic, nhưng KHÔNG restart pod.
   * Khi dependency recovery → probe pass lại → traffic resume.
   */
  @Get('readiness')
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.prismaHealth.isHealthy('database'),
      () => this.redisHealth.isHealthy('redis'),
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
    ]);
  }
}
