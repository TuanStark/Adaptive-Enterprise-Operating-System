export class CreateChannelCommand {
  constructor(
    public readonly tenantId: string,
    public readonly workspaceId: string,
    public readonly name: string,
    public readonly creatorId: string,
    public readonly type: string = 'PUBLIC',
    public readonly description: string | null = null,
  ) {}
}
