export class UpdateWorkspaceMemberProfileCommand {
  constructor(
    public readonly workspaceId: string,
    public readonly userId: string,
    public readonly nickname: string | null,
    public readonly avatarUrl: string | null,
    public readonly title: string | null,
    public readonly department: string | null,
    public readonly statusMessage: string | null,
  ) {}
}
