import { Sprint } from '../aggregates/sprint.aggregate';

export interface SprintRepository {
  save(sprint: Sprint): Promise<void>;
  findById(id: string): Promise<Sprint | null>;
  findByProjectId(projectId: string): Promise<Sprint[]>;
  findActiveByProjectId(projectId: string): Promise<Sprint | null>;
}

export const SPRINT_REPOSITORY = Symbol('SPRINT_REPOSITORY');
