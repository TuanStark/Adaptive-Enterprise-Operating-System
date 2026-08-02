import { Controller, Post, Patch, Body, Param, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { DomainError } from '@aeos/errors';
import { CreateWorkspaceRequestDto } from '../dto/create-workspace.request.dto';
import { CreateWorkspaceCommand } from '../../application/commands/create-workspace/create-workspace.command';
import { CreateWorkspaceHandler } from '../../application/commands/create-workspace/create-workspace.handler';
import { ArchiveWorkspaceCommand } from '../../application/commands/archive-workspace/archive-workspace.command';
import { ArchiveWorkspaceHandler } from '../../application/commands/archive-workspace/archive-workspace.handler';

@Controller('workspaces')
export class WorkspaceController {
  constructor(
    private readonly createHandler: CreateWorkspaceHandler,
    private readonly archiveHandler: ArchiveWorkspaceHandler,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateWorkspaceRequestDto, @Req() req: Request) {
    const user = (req as any).user;
    const command = new CreateWorkspaceCommand(
      dto.tenantId,
      dto.organizationId,
      dto.name,
      dto.description ?? null,
      user.userId,
    );

    const result = await this.createHandler.execute(command);
    if (result.isFail) {
      throw result.error as DomainError;
    }
    return result.value;
  }

  @Patch(':id/archive')
  @HttpCode(HttpStatus.OK)
  async archive(@Param('id') id: string) {
    const command = new ArchiveWorkspaceCommand(id);
    const result = await this.archiveHandler.execute(command);
    if (result.isFail) {
      throw result.error as DomainError;
    }
    return { message: 'Workspace archived successfully.' };
  }
}
