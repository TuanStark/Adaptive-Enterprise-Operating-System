export class CreateSprintCommand {
  constructor(
    public readonly tenantId: string,
    public readonly projectId: string,
    public readonly name: string,
    public readonly goal: string | null,
    public readonly startDate: string | null,
    public readonly endDate: string | null,
  ) {}
}
