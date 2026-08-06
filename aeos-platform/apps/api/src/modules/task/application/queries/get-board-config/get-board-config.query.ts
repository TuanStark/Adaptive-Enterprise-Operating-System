export class GetBoardConfigQuery {
  constructor(
    public readonly projectId: string,
    public readonly tenantId?: string,
    public readonly workspaceId?: string,
  ) {}
}
