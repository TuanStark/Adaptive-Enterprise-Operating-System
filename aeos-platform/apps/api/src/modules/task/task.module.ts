import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaService } from '@aeos/database';
import { TASK_REPOSITORY } from './domain/repositories/task.repository';
import { PrismaTaskRepository } from './infrastructure/persistence/prisma-task.repository';
import { CreateTaskHandler } from './application/commands/create-task/create-task.handler';
import { ChangeTaskStatusHandler } from './application/commands/change-task-status/change-task-status.handler';
import { AssignTaskHandler } from './application/commands/assign-task/assign-task.handler';
import { MoveTaskToSprintHandler } from './application/commands/move-task-to-sprint/move-task-to-sprint.handler';
import { UpdateTaskHandler } from './application/commands/update-task/update-task.handler';
import { DeleteTaskHandler } from './application/commands/delete-task/delete-task.handler';
import { GetTasksHandler } from './application/queries/get-tasks/get-tasks.handler';
import { GetTaskDetailHandler } from './application/queries/get-task-detail/get-task-detail.handler';
import { GetBoardConfigHandler } from './application/queries/get-board-config/get-board-config.handler';
import { SaveBoardConfigHandler } from './application/commands/save-board-config/save-board-config.handler';
import { TaskController } from './presentation/controllers/task.controller';
import { BoardConfigController } from './presentation/controllers/board-config.controller';
import { EventsModule } from '../../common/events/events.module';

@Module({
  imports: [EventsModule, CqrsModule],
  controllers: [TaskController, BoardConfigController],
  providers: [
    PrismaService,
    { provide: TASK_REPOSITORY, useClass: PrismaTaskRepository },
    // Commands
    CreateTaskHandler,
    ChangeTaskStatusHandler,
    AssignTaskHandler,
    MoveTaskToSprintHandler,
    UpdateTaskHandler,
    DeleteTaskHandler,
    SaveBoardConfigHandler,
    // Queries
    GetTasksHandler,
    GetTaskDetailHandler,
    GetBoardConfigHandler,
  ],
  exports: [TASK_REPOSITORY],
})
export class TaskModule {}
