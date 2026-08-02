import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { HealthModule } from './health/health.module';
import { IdentityModule } from './modules/identity/identity.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),

    // ── Health Check ──
    HealthModule,

    // ── Business Modules ──
    IdentityModule,

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
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
