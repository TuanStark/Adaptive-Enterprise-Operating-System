import { Inject } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { GetBoardConfigQuery } from './get-board-config.query';
import { generateId } from '@aeos/common';

export interface BoardColumnConfig {
  id: string;
  name: string;
  statuses: string[];
  order: number;
  wipLimit?: number;
}

export interface BoardConfigResult {
  id: string;
  projectId: string;
  name: string;
  columns: BoardColumnConfig[];
}

const DEFAULT_COLUMNS: BoardColumnConfig[] = [
  { id: 'col-todo', name: 'TO DO', statuses: ['BACKLOG', 'TODO'], order: 0 },
  { id: 'col-in-progress', name: 'IN PROGRESS', statuses: ['IN_PROGRESS', 'BLOCKED', 'REVIEW'], order: 1 },
  { id: 'col-done', name: 'DONE', statuses: ['DONE', 'CANCELLED'], order: 2 },
];

export class GetBoardConfigHandler {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async execute(query: GetBoardConfigQuery): Promise<BoardConfigResult> {
    let config = await this.prisma.boardConfig.findUnique({
      where: { projectId: query.projectId },
    });

    // Auto-create default config if none exists
    if (!config) {
      // Need workspaceId for creation — look up from project if not provided
      let workspaceId = query.workspaceId ?? '';
      if (!workspaceId) {
        const project = await this.prisma.project.findUnique({
          where: { id: query.projectId },
          select: { workspaceId: true },
        });
        workspaceId = project?.workspaceId ?? '';
      }

      config = await this.prisma.boardConfig.create({
        data: {
          id: generateId(),
          tenantId: query.tenantId ?? null,
          workspaceId,
          projectId: query.projectId,
          columns: JSON.parse(JSON.stringify(DEFAULT_COLUMNS)),
        },
      });
    }

    return {
      id: config.id,
      projectId: config.projectId,
      name: config.name,
      columns: (config.columns as unknown as BoardColumnConfig[]) ?? DEFAULT_COLUMNS,
    };
  }
}
