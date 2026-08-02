export class CreateWorkspaceCommand {
  constructor(
    public readonly tenantId: string,
    public readonly organizationId: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly ownerId: string,
  ) {}
}
