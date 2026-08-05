import { Controller, Post, Get, Patch, Body, Param, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { DomainError } from '@aeos/errors';
import { CreateWorkspaceRequestDto } from '../dto/create-workspace.request.dto';
import { CreateWorkspaceCommand } from '../../application/commands/create-workspace/create-workspace.command';
import { CreateWorkspaceHandler } from '../../application/commands/create-workspace/create-workspace.handler';
import { ArchiveWorkspaceCommand } from '../../application/commands/archive-workspace/archive-workspace.command';
import { ArchiveWorkspaceHandler } from '../../application/commands/archive-workspace/archive-workspace.handler';
import { UpdateWorkspaceCommand } from '../../application/commands/update-workspace/update-workspace.command';
import { UpdateWorkspaceHandler } from '../../application/commands/update-workspace/update-workspace.handler';
import { GetUserWorkspacesQuery } from '../../application/queries/get-user-workspaces/get-user-workspaces.query';
import { GetUserWorkspacesHandler } from '../../application/queries/get-user-workspaces/get-user-workspaces.handler';

@Controller('workspaces')
export class WorkspaceController {
  constructor(
    private readonly createHandler: CreateWorkspaceHandler,
    private readonly archiveHandler: ArchiveWorkspaceHandler,
    private readonly updateHandler: UpdateWorkspaceHandler,
    private readonly getUserWorkspacesHandler: GetUserWorkspacesHandler,
  ) {}

  @Get('me')
  async getMyWorkspaces(@Req() req: Request) {
    const user = (req as any).user;
    const query = new GetUserWorkspacesQuery(user.userId);
    return this.getUserWorkspacesHandler.execute(query);
  }

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

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: { name?: string; description?: string; domain?: string }) {
    const command = new UpdateWorkspaceCommand(id, dto.name, dto.description, dto.domain);
    const result = await this.updateHandler.execute(command);
    if (result.isFail) {
      throw result.error as DomainError;
    }
    return { message: 'Workspace updated successfully.' };
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

