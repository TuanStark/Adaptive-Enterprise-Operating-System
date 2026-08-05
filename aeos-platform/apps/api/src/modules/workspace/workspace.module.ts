import { Module } from '@nestjs/common';
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
import { WorkspaceController } from './presentation/controllers/workspace.controller';

@Module({
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
  ],
  exports: [WORKSPACE_REPOSITORY],
})
export class WorkspaceModule {}
