import { Task } from '../aggregates/task.aggregate';

export interface TaskFilters {
  workspaceId?: string;
  projectId?: string;
  sprintId?: string;
  status?: string;
  assigneeId?: string;
  reporterId?: string;
  priority?: string;
  type?: string;
  labels?: string[];
  fixVersionId?: string;
  search?: string;
}

export interface TaskRepository {
  save(task: Task): Promise<void>;
  findById(id: string): Promise<Task | null>;
  findAll(
    filters: TaskFilters,
    page: number,
    limit: number,
  ): Promise<{ data: Task[]; total: number }>;
}

export const TASK_REPOSITORY = Symbol('TASK_REPOSITORY');
