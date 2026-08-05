export class GetTasksQuery {
  constructor(
    public readonly filters: {
      projectId?: string;
      sprintId?: string;
      status?: string;
      assigneeId?: string;
      priority?: string;
    },
    public readonly page: number,
    public readonly limit: number,
  ) {}
}
