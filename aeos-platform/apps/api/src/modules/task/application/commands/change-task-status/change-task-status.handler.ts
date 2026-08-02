import { Inject } from '@nestjs/common';
import { Result, DomainError, NotFoundError } from '@aeos/errors';
import { TaskRepository, TASK_REPOSITORY } from '../../../domain/repositories/task.repository';
import { TaskStatus } from '../../../domain/aggregates/task.aggregate';

export class ChangeTaskStatusCommand {
  constructor(
    public readonly taskId: string,
    public readonly newStatus: string,
  ) {}
}

export class ChangeTaskStatusHandler {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(command: ChangeTaskStatusCommand): Promise<Result<void, DomainError>> {
    const task = await this.taskRepository.findById(command.taskId);
    if (!task) return Result.fail(new NotFoundError('Task', command.taskId));

    const statusResult = task.changeStatus(command.newStatus as TaskStatus);
    if (statusResult.isFail) return Result.fail(statusResult.error);

    await this.taskRepository.save(task);
    return Result.ok(undefined);
  }
}
