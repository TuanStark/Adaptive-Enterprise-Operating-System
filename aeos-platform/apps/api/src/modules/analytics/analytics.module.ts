import { Module } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { GetWorkspaceAnalyticsHandler } from './application/queries/get-workspace-analytics/get-workspace-analytics.handler';
import { GetWorkspaceVelocityHandler } from './application/queries/get-workspace-velocity/get-workspace-velocity.handler';
import { GetWorkspaceBurndownHandler } from './application/queries/get-workspace-burndown/get-workspace-burndown.handler';
import { AnalyticsController } from './presentation/controllers/analytics.controller';
import { WorkspaceAnalyticsProjectionHandler } from './application/events/workspace-analytics-projection.handler';

@Module({
  controllers: [AnalyticsController],
  providers: [
    PrismaService,
    GetWorkspaceAnalyticsHandler,
    GetWorkspaceVelocityHandler,
    GetWorkspaceBurndownHandler,
    WorkspaceAnalyticsProjectionHandler,
  ],
})
export class AnalyticsModule {}
