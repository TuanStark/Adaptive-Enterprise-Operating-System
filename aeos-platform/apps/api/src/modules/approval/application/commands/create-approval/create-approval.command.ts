export class CreateApprovalCommand {
  constructor(
    public readonly tenantId: string,
    public readonly workspaceId: string,
    public readonly requesterId: string,
    public readonly title: string,
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly reviewerIds: string[],
    public readonly metadata?: Record<string, any>,
  ) {}
}
