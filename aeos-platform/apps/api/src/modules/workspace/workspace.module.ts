import { Module } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { WORKSPACE_REPOSITORY } from './domain/repositories/workspace.repository';
import { PrismaWorkspaceRepository } from './infrastructure/persistence/prisma-workspace.repository';
import { CreateWorkspaceHandler } from './application/commands/create-workspace/create-workspace.handler';
import { ArchiveWorkspaceHandler } from './application/commands/archive-workspace/archive-workspace.handler';
import { GetUserWorkspacesHandler } from './application/queries/get-user-workspaces/get-user-workspaces.handler';
import { WorkspaceController } from './presentation/controllers/workspace.controller';

@Module({
  controllers: [WorkspaceController],
  providers: [
    PrismaService,
    { provide: WORKSPACE_REPOSITORY, useClass: PrismaWorkspaceRepository },
    CreateWorkspaceHandler,
    ArchiveWorkspaceHandler,
    GetUserWorkspacesHandler,
  ],
  exports: [WORKSPACE_REPOSITORY],
})
export class WorkspaceModule {}

