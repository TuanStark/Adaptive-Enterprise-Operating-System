export class CreateFormCommand {
  constructor(
    public readonly tenantId: string,
    public readonly workspaceId: string,
    public readonly name: string,
    public readonly schema: Record<string, any>,
    public readonly description?: string,
  ) {}
}
