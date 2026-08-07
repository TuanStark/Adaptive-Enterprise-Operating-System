import { IIntegrationEvent } from '@aeos/shared-kernel';

export class WorkspaceMemberAddedIntegrationEvent implements IIntegrationEvent {
  public static readonly EVENT_TYPE = 'WorkspaceMemberAddedEvent';
  constructor(payload: any) {
    this.eventId = payload.eventId || '';
    this.occurredOn = payload.occurredOn || new Date();
    this.memberId = payload.memberId;
    this.workspaceId = payload.workspaceId;
  }
  eventId: string; occurredOn: Date; memberId: string; workspaceId: string;
}

export class WorkspaceMemberRemovedIntegrationEvent implements IIntegrationEvent {
  public static readonly EVENT_TYPE = 'WorkspaceMemberRemovedEvent';
  constructor(payload: any) {
    this.eventId = payload.eventId || '';
    this.occurredOn = payload.occurredOn || new Date();
    this.memberId = payload.memberId;
    this.workspaceId = payload.workspaceId;
  }
  eventId: string; occurredOn: Date; memberId: string; workspaceId: string;
}
