import { Inject } from '@nestjs/common';
import { Result, DomainError, NotFoundError } from '@aeos/errors';
import { TaskRepository, TASK_REPOSITORY } from '../../../domain/repositories/task.repository';

export class AssignTaskCommand {
  constructor(
    public readonly taskId: string,
    public readonly assigneeId: string,
  ) {}
}

export class AssignTaskHandler {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(command: AssignTaskCommand): Promise<Result<void, DomainError>> {
    const task = await this.taskRepository.findById(command.taskId);
    if (!task) return Result.fail(new NotFoundError('Task', command.taskId));

    const assignResult = task.assign(command.assigneeId);
    if (assignResult.isFail) return Result.fail(assignResult.error);

    await this.taskRepository.save(task);
    return Result.ok(undefined);
  }
}
