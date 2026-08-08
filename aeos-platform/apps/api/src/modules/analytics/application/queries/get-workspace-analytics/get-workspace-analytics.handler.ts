import { Injectable } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { Result, DomainError } from '@aeos/errors';
import { GetWorkspaceAnalyticsQuery } from './get-workspace-analytics.query';

export interface WorkspaceAnalyticsResult {
  overview: {
    totalProjects: number;
    activeProjects: number;
    totalTasks: number;
    pendingTasks: number;
    totalDocuments: number;
    totalForms: number;
    totalApprovals: number;
    totalUsers: number;
    totalComments: number;
  };
}

@Injectable()
export class GetWorkspaceAnalyticsHandler {
  constructor(private readonly prisma: PrismaService) { }

  async execute(query: GetWorkspaceAnalyticsQuery): Promise<Result<WorkspaceAnalyticsResult, DomainError>> {
    const { workspaceId } = query;

    let record = await this.prisma.workspaceAnalytics.findUnique({
      where: { workspaceId },
    });

    if (!record) {
      record = {
        workspaceId,
        totalProjects: 0,
        activeProjects: 0,
        totalTasks: 0,
        pendingTasks: 0,
        totalDocuments: 0,
        totalForms: 0,
        totalApprovals: 0,
        totalUsers: 0,
        totalComments: 0,
        updatedAt: new Date(),
      };
    }

    return Result.ok({
      overview: {
        totalProjects: record.totalProjects,
        activeProjects: record.activeProjects,
        totalTasks: record.totalTasks,
        pendingTasks: record.pendingTasks,
        totalDocuments: record.totalDocuments,
        totalForms: record.totalForms,
        totalApprovals: record.totalApprovals,
        totalUsers: record.totalUsers,
        totalComments: record.totalComments,
      },
    });
  }
}
