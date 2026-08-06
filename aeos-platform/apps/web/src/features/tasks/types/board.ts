// ── Board Configuration Types ──

export type TaskStatusValue =
  | 'BACKLOG'
  | 'TODO'
  | 'IN_PROGRESS'
  | 'BLOCKED'
  | 'REVIEW'
  | 'DONE'
  | 'CANCELLED';

export const ALL_STATUSES: TaskStatusValue[] = [
  'BACKLOG', 'TODO', 'IN_PROGRESS', 'BLOCKED', 'REVIEW', 'DONE', 'CANCELLED',
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
