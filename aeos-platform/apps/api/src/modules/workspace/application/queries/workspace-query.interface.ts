import { UserWorkspaceDto } from './get-user-workspaces/get-user-workspaces.handler';
import { PaginatedMembersResult } from './get-workspace-members/get-workspace-members.handler';

export interface RawWorkspaceMemberDto {
  id: string;
  userId: string;
  role: string;
  joinedAt: string | null;
}

export interface PaginatedRawMembersResult {
  data: RawWorkspaceMemberDto[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface WorkspaceQuery {
  getUserWorkspaces(userId: string): Promise<UserWorkspaceDto[]>;
  getWorkspaceMembers(workspaceId: string, page: number, limit: number, filterUserIds?: string[]): Promise<PaginatedRawMembersResult>;
}

export const WORKSPACE_QUERY = Symbol('WORKSPACE_QUERY');
