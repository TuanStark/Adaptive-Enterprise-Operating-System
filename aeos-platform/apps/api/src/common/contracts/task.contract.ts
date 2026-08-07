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
