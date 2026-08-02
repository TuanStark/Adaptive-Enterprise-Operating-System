import { DomainEvent } from '@aeos/shared-kernel';

export class TaskCreatedEvent extends DomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly projectId: string,
    public readonly title: string,
  ) {
    super(taskId);
  }
  toPayload(): Record<string, unknown> {
    return { taskId: this.taskId, projectId: this.projectId, title: this.title };
  }
}

export class TaskStatusChangedEvent extends DomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly fromStatus: string,
    public readonly toStatus: string,
  ) {
    super(taskId);
  }
  toPayload(): Record<string, unknown> {
    return { taskId: this.taskId, fromStatus: this.fromStatus, toStatus: this.toStatus };
  }
}

export class TaskAssignedEvent extends DomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly assigneeId: string,
  ) {
    super(taskId);
  }
  toPayload(): Record<string, unknown> {
    return { taskId: this.taskId, assigneeId: this.assigneeId };
  }
}
