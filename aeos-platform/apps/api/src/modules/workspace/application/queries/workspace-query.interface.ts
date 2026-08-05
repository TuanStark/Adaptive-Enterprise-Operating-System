import { UserWorkspaceDto } from './get-user-workspaces/get-user-workspaces.handler';
import { PaginatedMembersResult } from './get-workspace-members/get-workspace-members.handler';

export interface WorkspaceQuery {
  getUserWorkspaces(userId: string): Promise<UserWorkspaceDto[]>;
  getWorkspaceMembers(workspaceId: string, page: number, limit: number): Promise<PaginatedMembersResult>;
}

export const WORKSPACE_QUERY = Symbol('WORKSPACE_QUERY');
