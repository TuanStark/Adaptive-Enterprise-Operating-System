import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { DomainError } from '@aeos/errors';
import { GetWorkspaceAnalyticsQuery } from '../../application/queries/get-workspace-analytics/get-workspace-analytics.query';
import { GetWorkspaceAnalyticsHandler } from '../../application/queries/get-workspace-analytics/get-workspace-analytics.handler';
import { GetWorkspaceVelocityQuery } from '../../application/queries/get-workspace-velocity/get-workspace-velocity.query';
import { GetWorkspaceVelocityHandler } from '../../application/queries/get-workspace-velocity/get-workspace-velocity.handler';
import { GetWorkspaceBurndownQuery } from '../../application/queries/get-workspace-burndown/get-workspace-burndown.query';
import { GetWorkspaceBurndownHandler } from '../../application/queries/get-workspace-burndown/get-workspace-burndown.handler';

@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly getWorkspaceAnalyticsHandler: GetWorkspaceAnalyticsHandler,
    private readonly getWorkspaceVelocityHandler: GetWorkspaceVelocityHandler,
    private readonly getWorkspaceBurndownHandler: GetWorkspaceBurndownHandler,
  ) {}

  @Get('workspace')
  @HttpCode(HttpStatus.OK)
  async getWorkspaceAnalytics(@Query('workspaceId') workspaceId: string) {
    if (!workspaceId) {
      throw new Error('Workspace ID is required'); // Simple validation
    }
    const result = await this.getWorkspaceAnalyticsHandler.execute(new GetWorkspaceAnalyticsQuery(workspaceId));
    if (result.isFail) throw result.error as DomainError;
    return result.value;
  }

  @Get('workspace/velocity')
  @HttpCode(HttpStatus.OK)
  async getWorkspaceVelocity(@Query('workspaceId') workspaceId: string) {
    if (!workspaceId) {
      throw new Error('Workspace ID is required'); // Simple validation
    }
    const result = await this.getWorkspaceVelocityHandler.execute(new GetWorkspaceVelocityQuery(workspaceId));
    if (result.isFail) throw result.error as DomainError;
    return result.value;
  }

  @Get('workspace/burndown')
  @HttpCode(HttpStatus.OK)
  async getWorkspaceBurndown(@Query('workspaceId') workspaceId: string) {
    if (!workspaceId) {
      throw new Error('Workspace ID is required'); // Simple validation
    }
    const result = await this.getWorkspaceBurndownHandler.execute(new GetWorkspaceBurndownQuery(workspaceId));
    if (result.isFail) throw result.error as DomainError;
    return result.value;
  }
}
