import { Module } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { GetWorkspaceAnalyticsHandler } from './application/queries/get-workspace-analytics/get-workspace-analytics.handler';
import { AnalyticsController } from './presentation/controllers/analytics.controller';

@Module({
  controllers: [AnalyticsController],
  providers: [
    PrismaService,
    GetWorkspaceAnalyticsHandler,
  ],
})
export class AnalyticsModule {}
