export class GetWorkspaceMemberQuery {
  constructor(
    public readonly workspaceId: string,
    public readonly userId: string,
  ) {}
}
