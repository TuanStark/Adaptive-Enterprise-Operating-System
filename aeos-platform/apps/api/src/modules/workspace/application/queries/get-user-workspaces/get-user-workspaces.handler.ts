import { Injectable, Inject } from '@nestjs/common';
import { GetUserWorkspacesQuery } from './get-user-workspaces.query';
import { WORKSPACE_QUERY, WorkspaceQuery } from '../workspace-query.interface';

export interface WorkspaceMembershipDto {
  roleId: string | null;
  roleName: string | null;
  joinedAt: Date | null;
}

export interface UserWorkspaceDto {
  id: string;
  name: string | null;
  description: string | null;
  organizationId: string | null;
  status: string | null;
  membership: WorkspaceMembershipDto;
}

@Injectable()
export class GetUserWorkspacesHandler {
  constructor(
    @Inject(WORKSPACE_QUERY)
    private readonly workspaceQuery: WorkspaceQuery,
  ) {}

  async execute(query: GetUserWorkspacesQuery): Promise<UserWorkspaceDto[]> {
    return this.workspaceQuery.getUserWorkspaces(query.userId);
  }
}
