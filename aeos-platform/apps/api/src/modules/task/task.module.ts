import { Module } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { TASK_REPOSITORY } from './domain/repositories/task.repository';
import { PrismaTaskRepository } from './infrastructure/persistence/prisma-task.repository';
import { CreateTaskHandler } from './application/commands/create-task/create-task.handler';
import { ChangeTaskStatusHandler } from './application/commands/change-task-status/change-task-status.handler';
import { AssignTaskHandler } from './application/commands/assign-task/assign-task.handler';
import { MoveTaskToSprintHandler } from './application/commands/move-task-to-sprint/move-task-to-sprint.handler';
import { TaskController } from './presentation/controllers/task.controller';

@Module({
  controllers: [TaskController],
  providers: [
    PrismaService,
    { provide: TASK_REPOSITORY, useClass: PrismaTaskRepository },
    CreateTaskHandler,
    ChangeTaskStatusHandler,
    AssignTaskHandler,
    MoveTaskToSprintHandler,
  ],
  exports: [TASK_REPOSITORY],
})
export class TaskModule {}
