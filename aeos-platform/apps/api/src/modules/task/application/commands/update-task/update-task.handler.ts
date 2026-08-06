import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Result, DomainError } from '@aeos/errors';
import { TaskRepository, TASK_REPOSITORY } from '../../../domain/repositories/task.repository';
import { TaskPriority, TaskType } from '../../../domain/aggregates/task.aggregate';
import { UpdateTaskCommand } from './update-task.command';

@Injectable()
export class UpdateTaskHandler {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(command: UpdateTaskCommand): Promise<Result<void, DomainError>> {
    const task = await this.taskRepository.findById(command.taskId);
    if (!task) {
      throw new NotFoundException(`Task ${command.taskId} not found`);
    }

    // Apply partial updates only for fields provided
    if (command.title !== undefined || command.description !== undefined) {
      const updateResult = task.updateDetails(
        command.title ?? task.title,
        command.description !== undefined ? command.description : task.description,
      );
      if (updateResult.isFail) return Result.fail(updateResult.error);
    }

    if (command.priority !== undefined) {
      task.changePriority(command.priority as TaskPriority);
    }

    if (command.type !== undefined) {
      task.changeType(command.type as TaskType);
    }

    if (command.storyPoints !== undefined) {
      task.setStoryPoints(command.storyPoints);
    }

    if (command.dueDate !== undefined) {
      task.setDueDate(command.dueDate ? new Date(command.dueDate) : null);
    }

    if (command.startDate !== undefined) {
      task.setStartDate(command.startDate ? new Date(command.startDate) : null);
    }

    if (command.resolution !== undefined) {
      if (command.resolution) {
        task.resolve(command.resolution);
      } else {
        task.clearResolution();
      }
    }

    if (command.labels !== undefined) {
      task.setLabels(command.labels);
    }

    if (command.environment !== undefined) {
      task.setEnvironment(command.environment);
    }

    if (command.fixVersionId !== undefined) {
      task.setFixVersion(command.fixVersionId);
    }

    if (command.reporterId !== undefined) {
      task.setReporter(command.reporterId);
    }

    if (command.originalEstimate !== undefined) {
      if (command.originalEstimate !== null) {
        task.setEstimate(command.originalEstimate);
      }
    }

    await this.taskRepository.save(task);
    return Result.ok(undefined);
  }
}
