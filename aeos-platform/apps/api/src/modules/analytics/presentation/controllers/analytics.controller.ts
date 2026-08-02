import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { DomainError } from '@aeos/errors';
import { GetWorkspaceAnalyticsQuery } from '../../application/queries/get-workspace-analytics/get-workspace-analytics.query';
import { GetWorkspaceAnalyticsHandler } from '../../application/queries/get-workspace-analytics/get-workspace-analytics.handler';

@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly getWorkspaceAnalyticsHandler: GetWorkspaceAnalyticsHandler,
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
}
