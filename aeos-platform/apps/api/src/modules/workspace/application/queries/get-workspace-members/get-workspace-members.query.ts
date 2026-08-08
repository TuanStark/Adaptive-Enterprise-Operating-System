export class GetWorkspaceMembersQuery {
  constructor(
    public readonly workspaceId: string,
    public readonly page: number = 1,
    public readonly limit: number = 50,
    public readonly search?: string,
  ) {}
}
