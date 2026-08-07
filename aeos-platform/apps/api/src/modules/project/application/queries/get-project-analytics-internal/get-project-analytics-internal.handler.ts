import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { GetProjectAnalyticsInternalQuery, ProjectAnalyticsDto } from '../../../../../common/contracts/project.contract';

@QueryHandler(GetProjectAnalyticsInternalQuery)
export class GetProjectAnalyticsInternalHandler implements IQueryHandler<GetProjectAnalyticsInternalQuery> {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async execute(query: GetProjectAnalyticsInternalQuery): Promise<ProjectAnalyticsDto> {
    const [totalProjects, activeProjects] = await Promise.all([
      this.prisma.project.count({ where: { workspaceId: query.workspaceId } }),
      this.prisma.project.count({ where: { workspaceId: query.workspaceId, status: 'ACTIVE' } }),
    ]);

    return { totalProjects, activeProjects };
  }
}
