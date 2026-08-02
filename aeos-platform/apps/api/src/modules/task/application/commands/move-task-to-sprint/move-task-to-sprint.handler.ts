import { Inject } from '@nestjs/common';
import { Result, DomainError, NotFoundError } from '@aeos/errors';
import { TaskRepository, TASK_REPOSITORY } from '../../../domain/repositories/task.repository';

export class MoveTaskToSprintCommand {
  constructor(
    public readonly taskId: string,
    public readonly sprintId: string | null,
  ) {}
}

export class MoveTaskToSprintHandler {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(command: MoveTaskToSprintCommand): Promise<Result<void, DomainError>> {
    const task = await this.taskRepository.findById(command.taskId);
    if (!task) return Result.fail(new NotFoundError('Task', command.taskId));

    if (command.sprintId) {
      task.moveToSprint(command.sprintId);
    } else {
      task.removeFromSprint();
    }

    await this.taskRepository.save(task);
    return Result.ok(undefined);
  }
}
