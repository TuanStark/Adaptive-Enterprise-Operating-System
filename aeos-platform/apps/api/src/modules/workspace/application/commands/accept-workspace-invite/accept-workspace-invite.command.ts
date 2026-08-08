export class AcceptWorkspaceInviteCommand {
  constructor(
    public readonly token: string,
    public readonly currentUserId: string,
  ) {}
}
