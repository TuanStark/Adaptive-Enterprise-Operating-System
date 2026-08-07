export class InviteMemberCommand {
  constructor(
    public readonly tenantId: string,
    public readonly workspaceId: string,
    public readonly inviterId: string,
    public readonly email: string,
  ) {}
}
