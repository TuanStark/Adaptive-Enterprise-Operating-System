import { DomainEvent } from '@aeos/shared-kernel';
export class TaskDeletedEvent extends DomainEvent {
  constructor(public readonly taskId: string, public readonly workspaceId: string) { super(taskId); }
  toPayload(): Record<string, unknown> { return { taskId: this.taskId, workspaceId: this.workspaceId }; }
}
