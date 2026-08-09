import { Controller, Get, Put, Body, Param, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { GetBoardConfigQuery } from '../../application/queries/get-board-config/get-board-config.query';
import { GetBoardConfigHandler } from '../../application/queries/get-board-config/get-board-config.handler';
import { SaveBoardConfigCommand } from '../../application/commands/save-board-config/save-board-config.command';
import { SaveBoardConfigHandler } from '../../application/commands/save-board-config/save-board-config.handler';

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string; tenantId: string };
}

@Controller('boards')
export class BoardConfigController {
  constructor(
    private readonly getBoardConfigHandler: GetBoardConfigHandler,
    private readonly saveBoardConfigHandler: SaveBoardConfigHandler,
  ) {}

  @Get(':projectId/config')
  async getConfig(@Param('projectId') projectId: string) {
    return this.getBoardConfigHandler.execute(new GetBoardConfigQuery(projectId));
  }

  @Put(':projectId/config')
  @HttpCode(HttpStatus.OK)
  async saveConfig(
    @Param('projectId') projectId: string,
    @Body()
    body: {
      name?: string;
      columns: Array<{
        id: string;
        name: string;
        statuses: string[];
        order: number;
        wipLimit?: number;
      }>;
    },
    @Req() req: AuthenticatedRequest,
  ) {
    // Extract tenantId from JWT, workspaceId from body or fallback
    const command = new SaveBoardConfigCommand(
      projectId,
      req.user.tenantId,
      (body as any).workspaceId ?? '',
      body.name ?? 'Board',
      body.columns,
    );
    return this.saveBoardConfigHandler.execute(command);
  }
}
