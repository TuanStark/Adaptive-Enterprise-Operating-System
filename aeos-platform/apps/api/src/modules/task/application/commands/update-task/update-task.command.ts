export class UpdateTaskCommand {
  constructor(
    public readonly taskId: string,
    public readonly title?: string,
    public readonly description?: string | null,
    public readonly priority?: string,
    public readonly type?: string,
    public readonly storyPoints?: number | null,
    public readonly dueDate?: string | null,
  ) {}
}
