import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EventsModule } from '../../common/events/events.module';
import { PrismaService } from '@aeos/database';
import { WORKSPACE_REPOSITORY } from './domain/repositories/workspace.repository';
import { PrismaWorkspaceRepository } from './infrastructure/persistence/prisma-workspace.repository';
import { WORKSPACE_QUERY } from './application/queries/workspace-query.interface';
import { PrismaWorkspaceQuery } from './infrastructure/queries/prisma-workspace.query';
import { CreateWorkspaceHandler } from './application/commands/create-workspace/create-workspace.handler';
import { ArchiveWorkspaceHandler } from './application/commands/archive-workspace/archive-workspace.handler';
import { UpdateWorkspaceHandler } from './application/commands/update-workspace/update-workspace.handler';
import { GetUserWorkspacesHandler } from './application/queries/get-user-workspaces/get-user-workspaces.handler';
import { GetWorkspaceMembersHandler } from './application/queries/get-workspace-members/get-workspace-members.handler';
import { GetWorkspaceMemberHandler } from './application/queries/get-workspace-member/get-workspace-member.handler';
import { GetWorkspaceHandler } from './application/queries/get-workspace/get-workspace.handler';
import { GetWorkspaceInternalHandler } from './application/queries/get-workspace-internal/get-workspace-internal.handler';
import { InviteMemberHandler } from './application/commands/invite-member/invite-member.handler';
import { AcceptWorkspaceInviteHandler } from './application/commands/accept-workspace-invite/accept-workspace-invite.handler';
import { ValidateWorkspaceInviteHandler } from './application/queries/validate-workspace-invite/validate-workspace-invite.handler';
import { WorkspaceMemberRoleAssignmentHandler } from './application/events/workspace-member-role-assignment.handler';
import { RemoveWorkspaceMemberHandler } from './application/commands/remove-member/remove-workspace-member.handler';
import { UpdateWorkspaceMemberProfileHandler } from './application/commands/update-workspace-member-profile/update-workspace-member-profile.handler';
import { WorkspaceController } from './presentation/controllers/workspace.controller';

@Module({
  imports: [EventsModule, CqrsModule],
  controllers: [WorkspaceController],
  providers: [
    PrismaService,
    { provide: WORKSPACE_REPOSITORY, useClass: PrismaWorkspaceRepository },
    { provide: WORKSPACE_QUERY, useClass: PrismaWorkspaceQuery },
    CreateWorkspaceHandler,
    ArchiveWorkspaceHandler,
    UpdateWorkspaceHandler,
    GetUserWorkspacesHandler,
    GetWorkspaceMembersHandler,
    GetWorkspaceMemberHandler,
    GetWorkspaceHandler,
    GetWorkspaceInternalHandler,
    InviteMemberHandler,
    AcceptWorkspaceInviteHandler,
    ValidateWorkspaceInviteHandler,
    WorkspaceMemberRoleAssignmentHandler,
    RemoveWorkspaceMemberHandler,
    UpdateWorkspaceMemberProfileHandler,
  ],
  exports: [WORKSPACE_REPOSITORY],
})
export class WorkspaceModule {}
