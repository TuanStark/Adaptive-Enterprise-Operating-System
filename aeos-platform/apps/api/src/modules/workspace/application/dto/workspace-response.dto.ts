export class WorkspaceResponseDto {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly organizationId: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly ownerId: string,
    public readonly status: string,
    public readonly memberCount: number,
    public readonly createdAt: Date,
  ) {}
}
