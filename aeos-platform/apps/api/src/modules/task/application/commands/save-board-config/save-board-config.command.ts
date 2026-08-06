export interface BoardColumnConfig {
  id: string;
  name: string;
  statuses: string[];
  order: number;
  wipLimit?: number;
}

export class SaveBoardConfigCommand {
  constructor(
    public readonly projectId: string,
    public readonly tenantId: string,
    public readonly workspaceId: string,
    public readonly name: string,
    public readonly columns: BoardColumnConfig[],
  ) {}
}
