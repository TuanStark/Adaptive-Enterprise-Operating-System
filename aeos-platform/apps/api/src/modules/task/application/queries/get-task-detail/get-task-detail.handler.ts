import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { TaskRepository, TASK_REPOSITORY } from '../../../domain/repositories/task.repository';
import { GetTaskDetailQuery } from './get-task-detail.query';

export interface TaskDetailDto {
  id: string;
  key: string;
  tenantId: string;
  projectId: string;
  title: string;
  description: string | null;
  status: string;
  type: string;
  priority: string;
  storyPoints: number | null;
  assigneeId: string | null;
  creatorId: string;
  sprintId: string | null;
  parentTaskId: string | null;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GetTaskDetailHandler {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(query: GetTaskDetailQuery): Promise<TaskDetailDto> {
    const task = await this.taskRepository.findById(query.taskId);
    if (!task) {
      throw new NotFoundException(`Task ${query.taskId} not found`);
    }

    return {
      id: task.id,
      key: task.key,
      tenantId: task.tenantId,
      projectId: task.projectId,
      title: task.title,
      description: task.description,
      status: task.status,
      type: task.type,
      priority: task.priority,
      storyPoints: task.storyPoints,
      assigneeId: task.assigneeId,
      creatorId: task.creatorId,
      sprintId: task.sprintId,
      parentTaskId: task.parentTaskId,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}
