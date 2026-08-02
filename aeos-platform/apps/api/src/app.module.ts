// apps/api/src/app.module.ts
import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // ── Rate Limiting (Global) ──
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,    // 1 giây
        limit: 3,     // 3 requests/giây (cho login, sensitive endpoints)
      },
      {
        name: 'medium',
        ttl: 10000,   // 10 giây
        limit: 20,    // 20 requests/10 giây (cho API thông thường)
      },
      {
        name: 'long',
        ttl: 60000,   // 1 phút
        limit: 100,   // 100 requests/phút (hard limit)
      },
    ]),

    // ── Health Check ──
    HealthModule,

    // ── Business Modules (sẽ thêm dần theo Phase) ──
    // IdentityModule,
    // OrganizationModule,
    // WorkspaceModule,
    // ProjectModule,
    // TaskModule,
    // KnowledgeModule,
    // NotificationModule,
    // AuditModule,
  ],
  providers: [
    // Rate limiting guard áp dụng cho toàn bộ API
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
