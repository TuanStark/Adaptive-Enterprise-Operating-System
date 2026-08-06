export class UpdateTaskCommand {
  constructor(
    public readonly taskId: string,
    public readonly title?: string,
    public readonly description?: string | null,
    public readonly priority?: string,
    public readonly type?: string,
    public readonly storyPoints?: number | null,
    public readonly dueDate?: string | null,
    public readonly startDate?: string | null,
    public readonly resolution?: string | null,
    public readonly labels?: string[],
    public readonly environment?: string | null,
    public readonly fixVersionId?: string | null,
    public readonly reporterId?: string | null,
    public readonly originalEstimate?: number | null,
  ) {}
}
