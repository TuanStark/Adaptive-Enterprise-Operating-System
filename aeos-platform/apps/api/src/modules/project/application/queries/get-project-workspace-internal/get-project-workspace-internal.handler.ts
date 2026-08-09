import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import {
  GetProjectWorkspaceInternalQuery,
  ProjectWorkspaceDto,
} from '../../../../../common/contracts/project.contract';

@QueryHandler(GetProjectWorkspaceInternalQuery)
export class GetProjectWorkspaceInternalHandler implements IQueryHandler<GetProjectWorkspaceInternalQuery> {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async execute(query: GetProjectWorkspaceInternalQuery): Promise<ProjectWorkspaceDto | null> {
    const project = await this.prisma.project.findUnique({
      where: { id: query.projectId },
      select: { workspaceId: true },
    });

    if (!project) return null;
    return { workspaceId: project.workspaceId };
  }
}
