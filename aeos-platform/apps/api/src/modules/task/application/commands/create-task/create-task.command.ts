export class CreateTaskCommand {
  constructor(
    public readonly tenantId: string,
    public readonly projectId: string,
    public readonly title: string,
    public readonly description: string | null,
    public readonly creatorId: string,
    public readonly priority: string,
    public readonly type: string = 'TASK',
  ) {}
}
