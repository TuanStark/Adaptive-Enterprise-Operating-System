import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { TaskRepository, TASK_REPOSITORY } from '../../../domain/repositories/task.repository';
import { DeleteTaskCommand } from './delete-task.command';

@Injectable()
export class DeleteTaskHandler {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(command: DeleteTaskCommand): Promise<void> {
    const task = await this.taskRepository.findById(command.taskId);
    if (!task) {
      throw new NotFoundException(`Task ${command.taskId} not found`);
    }

    task.softDelete();
    await this.taskRepository.save(task);
  }
}
