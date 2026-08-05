import { Injectable, Inject } from '@nestjs/common';
import { GetWorkspaceMembersQuery } from './get-workspace-members.query';
import { WORKSPACE_QUERY, WorkspaceQuery } from '../workspace-query.interface';

export interface WorkspaceMemberDto {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  joinedAt: string | null;
}

export interface PaginatedMembersResult {
  data: WorkspaceMemberDto[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

@Injectable()
export class GetWorkspaceMembersHandler {
  constructor(
    @Inject(WORKSPACE_QUERY)
    private readonly workspaceQuery: WorkspaceQuery,
  ) {}

  async execute(query: GetWorkspaceMembersQuery): Promise<PaginatedMembersResult> {
    return this.workspaceQuery.getWorkspaceMembers(query.workspaceId, query.page, query.limit);
  }
}
