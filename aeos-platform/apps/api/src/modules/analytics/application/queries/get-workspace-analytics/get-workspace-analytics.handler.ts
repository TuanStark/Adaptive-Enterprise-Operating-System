import { Injectable } from '@nestjs/common';
import { Result, DomainError } from '@aeos/errors';
import { PrismaService } from '@aeos/database';
import { GetWorkspaceAnalyticsQuery } from './get-workspace-analytics.query';

@Injectable()
export class GetWorkspaceAnalyticsHandler {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetWorkspaceAnalyticsQuery): Promise<Result<any, DomainError>> {
    const { workspaceId } = query;

    const [
      totalProjects,
      totalTasks,
      totalDocuments,
      totalForms,
      totalApprovals,
    ] = await Promise.all([
      this.prisma.project.count({ where: { workspaceId } }),
      this.prisma.task.count({ where: { project: { workspaceId } } }),
      this.prisma.document.count({ where: { workspaceId } }),
      this.prisma.dynamicForm.count({ where: { workspaceId } }),
      this.prisma.approvalRequest.count({ where: { workspaceId } }),
    ]);

    const activeProjects = await this.prisma.project.count({
      where: { workspaceId, status: 'ACTIVE' },
    });

    const pendingTasks = await this.prisma.task.count({
      where: { project: { workspaceId }, status: { in: ['TODO', 'IN_PROGRESS'] } },
    });

    return Result.ok({
      overview: {
        totalProjects,
        activeProjects,
        totalTasks,
        pendingTasks,
        totalDocuments,
        totalForms,
        totalApprovals,
      },
    });
  }
}
