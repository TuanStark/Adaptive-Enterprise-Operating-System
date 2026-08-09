export class GetOrCreateDirectChannelCommand {
  constructor(
    public readonly tenantId: string,
    public readonly workspaceId: string,
    public readonly currentUserId: string,
    public readonly targetUserId: string,
  ) {}
}
