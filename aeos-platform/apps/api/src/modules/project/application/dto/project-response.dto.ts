export class ProjectResponseDto {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly workspaceId: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly ownerId: string,
    public readonly status: string,
    public readonly priority: string,
    public readonly startDate: Date | null,
    public readonly endDate: Date | null,
    public readonly memberCount: number,
    public readonly createdAt: Date,
  ) {}
}
