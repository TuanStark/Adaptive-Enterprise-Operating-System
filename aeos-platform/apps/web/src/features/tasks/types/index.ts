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

export type TaskLinkType = 'BLOCKS' | 'DUPLICATES' | 'RELATES_TO' | 'CLONES' | 'CAUSES';

export interface Task {
  id: string;
  key: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  title: string;
  description: string | null;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  resolution: string | null;
  labels: string[];
  storyPoints: number | null;
  originalEstimate: number | null;
  remainingEstimate: number | null;
  timeSpent: number;
  boardPosition: number;
  creatorId: string;
  reporterId: string | null;
  assigneeId: string | null;
  sprintId: string | null;
  parentTaskId: string | null;
  fixVersionId: string | null;
  startDate: string | null;
  dueDate: string | null;
  environment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDetail extends Task {
  // Extended detail fields can go here in the future
  // e.g. comments count, attachments count, etc.
}

export interface TaskFilters {
  workspaceId?: string;
  projectId?: string;
  sprintId?: string;
  status?: string;
  assigneeId?: string;
  reporterId?: string;
  priority?: string;
  type?: string;
  fixVersionId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateTaskInput {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  title: string;
  description?: string;
  type?: string;
  priority?: string;
  labels?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  priority?: string;
  type?: string;
  storyPoints?: number | null;
  dueDate?: string | null;
  startDate?: string | null;
  resolution?: string | null;
  labels?: string[];
  environment?: string | null;
  fixVersionId?: string | null;
  reporterId?: string | null;
  originalEstimate?: number | null;
}
