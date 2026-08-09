import { Inject } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { generateId } from '@aeos/common';
import { SaveBoardConfigCommand } from './save-board-config.command';
import type { BoardConfigResult } from '../../queries/get-board-config/get-board-config.handler';

export class SaveBoardConfigHandler {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async execute(command: SaveBoardConfigCommand): Promise<BoardConfigResult> {
    const config = await this.prisma.boardConfig.upsert({
      where: { projectId: command.projectId },
      create: {
        id: generateId(),
        tenantId: command.tenantId,
        workspaceId: command.workspaceId,
        projectId: command.projectId,
        name: command.name,
        columns: JSON.parse(JSON.stringify(command.columns)),
      },
      update: {
        name: command.name,
        columns: JSON.parse(JSON.stringify(command.columns)),
      },
    });

    return {
      id: config.id,
      projectId: config.projectId,
      name: config.name,
      columns: config.columns as unknown as BoardConfigResult['columns'],
    };
  }
}
