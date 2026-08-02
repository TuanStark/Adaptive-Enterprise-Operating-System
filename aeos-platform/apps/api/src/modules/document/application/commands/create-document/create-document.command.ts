export class CreateDocumentCommand {
  constructor(
    public readonly tenantId: string,
    public readonly workspaceId: string,
    public readonly name: string,
    public readonly ownerId: string,
    public readonly visibility: string,
  ) {}
}
