import { IIntegrationEvent } from '@aeos/shared-kernel';

export class GetWorkspaceInternalQuery {
  constructor(public readonly workspaceId: string) {}
}

export interface WorkspaceInternalDto {
  id: string;
  name: string;
}

export class WorkspaceMemberAddedIntegrationEvent implements IIntegrationEvent {
  public static readonly EVENT_TYPE = 'WorkspaceMemberAddedEvent';
  constructor(payload: any) {
    this.eventId = payload.eventId || '';
    this.occurredOn = payload.occurredOn || new Date();
    this.memberId = payload.memberId;
    this.workspaceId = payload.workspaceId;
  }
  eventId: string;
  occurredOn: Date;
  memberId: string;
  workspaceId: string;
}

export class WorkspaceMemberRemovedIntegrationEvent implements IIntegrationEvent {
  public static readonly EVENT_TYPE = 'WorkspaceMemberRemovedEvent';
  constructor(payload: any) {
    this.eventId = payload.eventId || '';
    this.occurredOn = payload.occurredOn || new Date();
    this.memberId = payload.memberId;
    this.workspaceId = payload.workspaceId;
  }
  eventId: string;
  occurredOn: Date;
  memberId: string;
  workspaceId: string;
}

export class WorkspaceMemberInvitedIntegrationEvent implements IIntegrationEvent {
  public static readonly EVENT_TYPE = 'WorkspaceMemberInvitedEvent';
  constructor(payload: any) {
    this.eventId = payload.eventId || '';
    this.occurredOn = payload.occurredOn || new Date();
    this.email = payload.email;
    this.workspaceId = payload.workspaceId;
    this.inviterId = payload.inviterId;
  }
  eventId: string;
  occurredOn: Date;
  email: string;
  workspaceId: string;
  inviterId: string;
}
