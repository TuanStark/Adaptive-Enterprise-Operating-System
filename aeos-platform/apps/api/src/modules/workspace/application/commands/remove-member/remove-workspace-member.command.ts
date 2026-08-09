export class RemoveWorkspaceMemberCommand {
  constructor(
    public readonly workspaceId: string,
    public readonly memberUserId: string,
    public readonly requesterUserId: string,
  ) {}
}
