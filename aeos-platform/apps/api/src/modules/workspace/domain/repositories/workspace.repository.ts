import { Workspace } from '../aggregates/workspace.aggregate';

export interface WorkspaceRepository {
  save(workspace: Workspace): Promise<void>;
  findById(id: string): Promise<Workspace | null>;
  findByOrganizationId(organizationId: string): Promise<Workspace[]>;
}

export const WORKSPACE_REPOSITORY = Symbol('WORKSPACE_REPOSITORY');
