import { Injectable, Inject } from '@nestjs/common';
import { TaskRepository, TASK_REPOSITORY } from '../../../domain/repositories/task.repository';
import { GetTasksQuery } from './get-tasks.query';

export interface TaskListItemDto {
  id: string;
  key: string;
  title: string;
  status: string;
  type: string;
  priority: string;
  storyPoints: number | null;
  assigneeId: string | null;
  sprintId: string | null;
  dueDate: Date | null;
  createdAt: Date;
}

export interface PaginatedTasksDto {
  data: TaskListItemDto[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

@Injectable()
export class GetTasksHandler {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(query: GetTasksQuery): Promise<PaginatedTasksDto> {
    const { data, total } = await this.taskRepository.findAll(
      query.filters, query.page, query.limit,
    );

    return {
      data: data.map((t) => ({
        id: t.id,
        key: t.key,
        title: t.title,
        status: t.status,
        type: t.type,
        priority: t.priority,
        storyPoints: t.storyPoints,
        assigneeId: t.assigneeId,
        sprintId: t.sprintId,
        dueDate: t.dueDate,
        createdAt: t.createdAt,
      })),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }
}
