// ── Board Configuration Types ──

export type TaskStatusValue =
  | 'BACKLOG'
  | 'TODO'
  | 'IN_PROGRESS'
  | 'BLOCKED'
  | 'REVIEW'
  | 'TESTING'
  | 'QA'
  | 'READY_FOR_RELEASE'
  | 'DEPLOYED'
  | 'DONE'
  | 'CANCELLED'
  | 'ON_HOLD';

export const ALL_STATUSES: TaskStatusValue[] = [
  'BACKLOG', 'TODO', 'IN_PROGRESS', 'BLOCKED', 'REVIEW', 
  'TESTING', 'QA', 'READY_FOR_RELEASE', 'DEPLOYED',
  'DONE', 'CANCELLED', 'ON_HOLD'
];

export interface BoardColumn {
  id: string;
  name: string;
  statuses: TaskStatusValue[];
  order: number;
  wipLimit?: number;
}

export interface BoardConfig {
  id: string;
  projectId: string;
  name: string;
  columns: BoardColumn[];
}
