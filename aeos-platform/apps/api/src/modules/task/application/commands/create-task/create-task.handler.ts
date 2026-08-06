import { Inject } from '@nestjs/common';
import { Result, DomainError } from '@aeos/errors';
import { Task, TaskPriority, TaskType } from '../../../domain/aggregates/task.aggregate';
import { TaskRepository, TASK_REPOSITORY } from '../../../domain/repositories/task.repository';
import { CreateTaskCommand } from './create-task.command';

export class CreateTaskHandler {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
  ) { }

  async execute(command: CreateTaskCommand): Promise<Result<{ id: string; key: string; title: string; status: string }, DomainError>> {
    const priority = (command.priority as TaskPriority) || TaskPriority.MEDIUM;
    const type = (command.type as TaskType) || TaskType.TASK;

    const key = `AEOS-${Date.now().toString(36).toUpperCase().slice(-4)}`;

    const createResult = Task.create(
      command.tenantId, command.workspaceId, command.projectId, key, command.title,
      command.description, command.creatorId, type, priority,
    );
    if (createResult.isFail) return Result.fail(createResult.error);

    const task = createResult.value;

    if (command.labels && command.labels.length > 0) {
      task.setLabels(command.labels);
    }

    await this.taskRepository.save(task);

    return Result.ok({ id: task.id, key: task.key, title: task.title, status: task.status });
  }
}
