import { Project } from '../aggregates/project.aggregate';

export interface ProjectRepository {
  save(project: Project): Promise<void>;
  findById(id: string): Promise<Project | null>;
  findByWorkspaceId(workspaceId: string, page: number, limit: number): Promise<{ data: Project[]; total: number }>;
}

export const PROJECT_REPOSITORY = Symbol('PROJECT_REPOSITORY');
