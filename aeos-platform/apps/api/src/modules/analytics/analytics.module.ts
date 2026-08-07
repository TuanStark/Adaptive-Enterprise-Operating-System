import { Module } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { GetWorkspaceAnalyticsHandler } from './application/queries/get-workspace-analytics/get-workspace-analytics.handler';
import { AnalyticsController } from './presentation/controllers/analytics.controller';
import { WorkspaceAnalyticsProjectionHandler } from './application/events/workspace-analytics-projection.handler';

@Module({
  controllers: [AnalyticsController],
  providers: [
    PrismaService,
    GetWorkspaceAnalyticsHandler,
    WorkspaceAnalyticsProjectionHandler,
  ],
})
export class AnalyticsModule {}
