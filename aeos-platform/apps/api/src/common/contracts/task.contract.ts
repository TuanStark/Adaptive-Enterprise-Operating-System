import { IIntegrationEvent } from '@aeos/shared-kernel';

export class TaskCreatedIntegrationEvent implements IIntegrationEvent {
  public static readonly EVENT_TYPE = 'TaskCreatedDomainEvent'; // Maps to the Domain Event type name saved in DB

  constructor(payload: any) {
    this.eventId = payload.eventId || '';
    this.occurredOn = payload.occurredOn || new Date();
    this.taskId = payload.taskId;
    this.title = payload.title;
    this.creatorId = payload.creatorId;
  }

  eventId: string;
  occurredOn: Date;
  
  taskId: string;
  title: string;
  creatorId: string;
}

export class GetTaskAnalyticsInternalQuery {
  constructor(public readonly workspaceId: string) {}
}

export interface TaskAnalyticsDto {
  totalTasks: number;
  pendingTasks: number;
}

export class TaskDeletedIntegrationEvent implements IIntegrationEvent {
  public static readonly EVENT_TYPE = 'TaskDeletedEvent';
  constructor(payload: any) {
    this.eventId = payload.eventId || '';
    this.occurredOn = payload.occurredOn || new Date();
    this.taskId = payload.taskId;
    this.workspaceId = payload.workspaceId;
  }
  eventId: string; occurredOn: Date; taskId: string; workspaceId: string;
}
