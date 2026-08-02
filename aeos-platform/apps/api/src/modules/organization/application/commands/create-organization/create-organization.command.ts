export class CreateOrganizationCommand {
  constructor(
    public readonly tenantId: string,
    public readonly name: string,
    public readonly ownerId: string,
  ) {}
}
