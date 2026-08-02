import { Module } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { PROJECT_REPOSITORY } from './domain/repositories/project.repository';
import { PrismaProjectRepository } from './infrastructure/persistence/prisma-project.repository';
import { CreateProjectHandler } from './application/commands/create-project/create-project.handler';
import { ChangeProjectStatusHandler } from './application/commands/change-project-status/change-project-status.handler';
import { ProjectController } from './presentation/controllers/project.controller';

@Module({
  controllers: [ProjectController],
  providers: [
    PrismaService,
    { provide: PROJECT_REPOSITORY, useClass: PrismaProjectRepository },
    CreateProjectHandler,
    ChangeProjectStatusHandler,
  ],
  exports: [PROJECT_REPOSITORY],
})
export class ProjectModule {}
