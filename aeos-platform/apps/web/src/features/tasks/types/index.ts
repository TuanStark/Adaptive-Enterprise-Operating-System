// ── Task types aligned with BE Task Aggregate ──

export type TaskStatus =
  | 'BACKLOG'
  | 'TODO'
  | 'IN_PROGRESS'
  | 'BLOCKED'
  | 'REVIEW'
  | 'DONE'
  | 'CANCELLED';

export type TaskType = 'EPIC' | 'STORY' | 'TASK' | 'BUG' | 'SUBTASK';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type Task = {
  id: string;
  key: string;
  title: string;
  description?: string | null;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  storyPoints: number | null;
  assigneeId: string | null;
  sprintId: string | null;
  projectId: string;
  parentTaskId?: string | null;
  dueDate: string | null;
  createdAt: string;
};
