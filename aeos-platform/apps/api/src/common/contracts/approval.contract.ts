export class GetApprovalAnalyticsInternalQuery {
  constructor(public readonly workspaceId: string) {}
}

export interface ApprovalAnalyticsDto {
  totalApprovals: number;
}

import { IIntegrationEvent } from '@aeos/shared-kernel';
export class ApprovalCreatedIntegrationEvent implements IIntegrationEvent {
  public static readonly EVENT_TYPE = 'ApprovalCreatedEvent';
  constructor(payload: any) {
    this.eventId = payload.eventId || '';
    this.occurredOn = payload.occurredOn || new Date();
    this.approvalId = payload.approvalId;
    this.workspaceId = payload.workspaceId;
  }
  eventId: string; occurredOn: Date; approvalId: string; workspaceId: string;
}
export class ApprovalDeletedIntegrationEvent implements IIntegrationEvent {
  public static readonly EVENT_TYPE = 'ApprovalDeletedEvent';
  constructor(payload: any) {
    this.eventId = payload.eventId || '';
    this.occurredOn = payload.occurredOn || new Date();
    this.approvalId = payload.approvalId;
    this.workspaceId = payload.workspaceId;
  }
  eventId: string; occurredOn: Date; approvalId: string; workspaceId: string;
}
