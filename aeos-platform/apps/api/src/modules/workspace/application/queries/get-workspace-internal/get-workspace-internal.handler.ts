import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@aeos/database';
import { GetWorkspaceInternalQuery, WorkspaceInternalDto } from '../../../../../common/contracts/workspace.contract';

@QueryHandler(GetWorkspaceInternalQuery)
export class GetWorkspaceInternalHandler implements IQueryHandler<GetWorkspaceInternalQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetWorkspaceInternalQuery): Promise<WorkspaceInternalDto | null> {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: query.workspaceId },
      select: { id: true, name: true },
    });

    if (!workspace) return null;

    return {
      id: workspace.id,
      name: workspace.name ?? 'Unknown Workspace',
    };
  }
}
