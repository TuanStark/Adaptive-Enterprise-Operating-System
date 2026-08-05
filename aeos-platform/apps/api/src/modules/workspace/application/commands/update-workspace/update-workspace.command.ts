export class UpdateWorkspaceCommand {
  constructor(
    public readonly workspaceId: string,
    public readonly name?: string,
    public readonly description?: string | null,
    public readonly domain?: string | null,
  ) {}
}
