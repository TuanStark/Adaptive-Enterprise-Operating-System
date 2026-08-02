import { Inject } from '@nestjs/common';
import { Result, DomainError } from '@aeos/errors';
import { Task, TaskPriority } from '../../../domain/aggregates/task.aggregate';
import { TaskRepository, TASK_REPOSITORY } from '../../../domain/repositories/task.repository';
import { CreateTaskCommand } from './create-task.command';

export class CreateTaskHandler {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(command: CreateTaskCommand): Promise<Result<{ id: string; title: string; status: string }, DomainError>> {
    const priority = (command.priority as TaskPriority) || TaskPriority.MEDIUM;
    const createResult = Task.create(
      command.tenantId, command.projectId, command.title,
      command.description, command.creatorId, priority,
    );
    if (createResult.isFail) return Result.fail(createResult.error);

    const task = createResult.value;
    await this.taskRepository.save(task);

    return Result.ok({ id: task.id, title: task.title, status: task.status });
  }
}
