export class OrganizationResponseDto {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly name: string,
    public readonly ownerId: string,
    public readonly memberCount: number,
    public readonly createdAt: Date,
  ) {}
}
