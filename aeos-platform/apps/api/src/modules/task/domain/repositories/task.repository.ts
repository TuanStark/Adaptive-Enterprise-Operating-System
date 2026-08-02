import { Task } from '../aggregates/task.aggregate';

export interface TaskFilters {
  projectId?: string;
  sprintId?: string;
  status?: string;
  assigneeId?: string;
  priority?: string;
}

export interface TaskRepository {
  save(task: Task): Promise<void>;
  findById(id: string): Promise<Task | null>;
  findAll(filters: TaskFilters, page: number, limit: number): Promise<{ data: Task[]; total: number }>;
}

export const TASK_REPOSITORY = Symbol('TASK_REPOSITORY');
