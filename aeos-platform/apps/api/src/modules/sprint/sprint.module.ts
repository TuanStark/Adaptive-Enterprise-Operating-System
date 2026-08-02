import { Module } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { SPRINT_REPOSITORY } from './domain/repositories/sprint.repository';
import { PrismaSprintRepository } from './infrastructure/persistence/prisma-sprint.repository';
import { CreateSprintHandler } from './application/commands/create-sprint/create-sprint.handler';
import { StartSprintHandler } from './application/commands/start-sprint/start-sprint.handler';
import { CompleteSprintHandler } from './application/commands/complete-sprint/complete-sprint.handler';
import { SprintController } from './presentation/controllers/sprint.controller';

@Module({
  controllers: [SprintController],
  providers: [
    PrismaService,
    { provide: SPRINT_REPOSITORY, useClass: PrismaSprintRepository },
    CreateSprintHandler,
    StartSprintHandler,
    CompleteSprintHandler,
  ],
  exports: [SPRINT_REPOSITORY],
})
export class SprintModule {}
