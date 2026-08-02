export class CreateProjectCommand {
  constructor(
    public readonly tenantId: string,
    public readonly workspaceId: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly ownerId: string,
    public readonly priority: string,
  ) {}
}
