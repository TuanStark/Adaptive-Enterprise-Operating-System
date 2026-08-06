import { TaskFilters } from '../../../domain/repositories/task.repository';

export class GetTasksQuery {
  constructor(
    public readonly filters: TaskFilters,
    public readonly page: number,
    public readonly limit: number,
  ) {}
}
