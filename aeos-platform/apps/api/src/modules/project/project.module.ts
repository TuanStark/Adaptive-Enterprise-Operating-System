import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EventsModule } from '../../common/events/events.module';
import { PrismaService } from '@aeos/database';
import { PROJECT_REPOSITORY } from './domain/repositories/project.repository';
import { PrismaProjectRepository } from './infrastructure/persistence/prisma-project.repository';
import { CreateProjectHandler } from './application/commands/create-project/create-project.handler';
import { ChangeProjectStatusHandler } from './application/commands/change-project-status/change-project-status.handler';
import { ProjectController } from './presentation/controllers/project.controller';
import { GetProjectAnalyticsInternalHandler } from './application/queries/get-project-analytics-internal/get-project-analytics-internal.handler';
import { GetProjectWorkspaceInternalHandler } from './application/queries/get-project-workspace-internal/get-project-workspace-internal.handler';

@Module({
  imports: [CqrsModule, EventsModule],
  controllers: [ProjectController],
  providers: [
    PrismaService,
    { provide: PROJECT_REPOSITORY, useClass: PrismaProjectRepository },
    CreateProjectHandler,
    ChangeProjectStatusHandler,
    GetProjectAnalyticsInternalHandler,
    GetProjectWorkspaceInternalHandler,
  ],
  exports: [PROJECT_REPOSITORY],
})
export class ProjectModule {}
