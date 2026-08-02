export class AddMemberCommand {
  constructor(
    public readonly organizationId: string,
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly role: string,
  ) {}
}
