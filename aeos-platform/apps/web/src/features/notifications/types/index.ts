export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_UPDATED'
  | 'COMMENT_ADDED'
  | 'MENTION'
  | 'SPRINT_STARTED'
  | 'SPRINT_COMPLETED'
  | 'APPROVAL_REQUESTED'
  | 'APPROVAL_PROCESSED'
  | 'MEETING_SCHEDULED';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  content: string | null;
  read: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}
