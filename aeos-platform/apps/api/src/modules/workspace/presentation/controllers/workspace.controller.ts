import { Controller, Post, Get, Patch, Body, Param, Query, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { DomainError, ValidationError } from '@aeos/errors';
import { CreateWorkspaceRequestDto } from '../dto/create-workspace.request.dto';
import { CreateWorkspaceCommand } from '../../application/commands/create-workspace/create-workspace.command';
import { CreateWorkspaceHandler } from '../../application/commands/create-workspace/create-workspace.handler';
import { ArchiveWorkspaceCommand } from '../../application/commands/archive-workspace/archive-workspace.command';
import { ArchiveWorkspaceHandler } from '../../application/commands/archive-workspace/archive-workspace.handler';
import { UpdateWorkspaceCommand } from '../../application/commands/update-workspace/update-workspace.command';
import { UpdateWorkspaceHandler } from '../../application/commands/update-workspace/update-workspace.handler';
import { InviteMemberCommand } from '../../application/commands/invite-member/invite-member.command';
import { InviteMemberHandler } from '../../application/commands/invite-member/invite-member.handler';
import { AcceptWorkspaceInviteCommand } from '../../application/commands/accept-workspace-invite/accept-workspace-invite.command';
import { AcceptWorkspaceInviteHandler } from '../../application/commands/accept-workspace-invite/accept-workspace-invite.handler';
import { RemoveWorkspaceMemberCommand } from '../../application/commands/remove-member/remove-workspace-member.command';
import { RemoveWorkspaceMemberHandler } from '../../application/commands/remove-member/remove-workspace-member.handler';
import { GetUserWorkspacesQuery } from '../../application/queries/get-user-workspaces/get-user-workspaces.query';
import { GetUserWorkspacesHandler } from '../../application/queries/get-user-workspaces/get-user-workspaces.handler';
import { GetWorkspaceMembersQuery } from '../../application/queries/get-workspace-members/get-workspace-members.query';
import { GetWorkspaceMembersHandler } from '../../application/queries/get-workspace-members/get-workspace-members.handler';
import { ValidateWorkspaceInviteQuery } from '../../application/queries/validate-workspace-invite/validate-workspace-invite.query';
import { ValidateWorkspaceInviteHandler } from '../../application/queries/validate-workspace-invite/validate-workspace-invite.handler';
import { Public } from '../../../identity/presentation/guards/public.decorator';
import { IsString, IsEmail, MinLength, MaxLength, IsOptional } from 'class-validator';

class InviteMemberRequestDto {
  @IsString() @IsEmail() email!: string;
}

class AcceptInviteRequestDto {
  @IsString() token!: string;
}

@Controller('workspaces')
export class WorkspaceController {
  constructor(
    private readonly createHandler: CreateWorkspaceHandler,
    private readonly archiveHandler: ArchiveWorkspaceHandler,
    private readonly updateHandler: UpdateWorkspaceHandler,
    private readonly getUserWorkspacesHandler: GetUserWorkspacesHandler,
    private readonly getWorkspaceMembersHandler: GetWorkspaceMembersHandler,
    private readonly inviteMemberHandler: InviteMemberHandler,
    private readonly acceptWorkspaceInviteHandler: AcceptWorkspaceInviteHandler,
    private readonly validateWorkspaceInviteHandler: ValidateWorkspaceInviteHandler,
    private readonly removeWorkspaceMemberHandler: RemoveWorkspaceMemberHandler,
  ) { }

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

  @Get(':id/members')
  async getMembers(
    @Param('id') workspaceId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const query = new GetWorkspaceMembersQuery(
      workspaceId,
      parseInt(page ?? '1', 10),
      parseInt(limit ?? '50', 10),
      search,
    );
    return this.getWorkspaceMembersHandler.execute(query);
  }

  @Post(':id/invites')
  @HttpCode(HttpStatus.OK)
  async inviteMember(
    @Param('id') workspaceId: string,
    @Body() dto: InviteMemberRequestDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    const command = new InviteMemberCommand(user.tenantId, workspaceId, user.userId, dto.email);
    const result = await this.inviteMemberHandler.execute(command);
    if (result.isFail) throw result.error as DomainError;
    return { message: 'Invitation sent' };
  }

  @Public()
  @Get('invites/validate')
  async validateInvite(@Query('token') token: string) {
    if (!token) {
      throw new ValidationError('Missing token');
    }
    const query = new ValidateWorkspaceInviteQuery(token);
    const result = await this.validateWorkspaceInviteHandler.execute(query);
    if (result.isFail) {
      throw result.error;
    }
    return result.value;
  }

  @Post('invites/accept')
  @HttpCode(HttpStatus.OK)
  async acceptInvite(@Body() dto: AcceptInviteRequestDto, @Req() req: Request) {
    const user = (req as any).user;
    const command = new AcceptWorkspaceInviteCommand(dto.token, user.userId);
    const result = await this.acceptWorkspaceInviteHandler.execute(command);
    if (result.isFail) throw result.error as DomainError;
    return { message: 'Invitation accepted successfully' };
  }

  @Post(':id/members/:userId/remove')
  @HttpCode(HttpStatus.OK)
  async removeMember(
    @Param('id') workspaceId: string,
    @Param('userId') memberUserId: string,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    const command = new RemoveWorkspaceMemberCommand(workspaceId, memberUserId, user.userId);
    const result = await this.removeWorkspaceMemberHandler.execute(command);
    if (result.isFail) throw result.error as DomainError;
    return { message: 'Member removed successfully' };
  }
}
