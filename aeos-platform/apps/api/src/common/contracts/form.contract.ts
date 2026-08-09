export class GetFormAnalyticsInternalQuery {
  constructor(public readonly workspaceId: string) {}
}

export interface FormAnalyticsDto {
  totalForms: number;
}

import { IIntegrationEvent } from '@aeos/shared-kernel';
export class FormCreatedIntegrationEvent implements IIntegrationEvent {
  public static readonly EVENT_TYPE = 'FormCreatedEvent';
  constructor(payload: any) {
    this.eventId = payload.eventId || '';
    this.occurredOn = payload.occurredOn || new Date();
    this.formId = payload.formId;
    this.workspaceId = payload.workspaceId;
  }
  eventId: string;
  occurredOn: Date;
  formId: string;
  workspaceId: string;
}
export class FormDeletedIntegrationEvent implements IIntegrationEvent {
  public static readonly EVENT_TYPE = 'FormDeletedEvent';
  constructor(payload: any) {
    this.eventId = payload.eventId || '';
    this.occurredOn = payload.occurredOn || new Date();
    this.formId = payload.formId;
    this.workspaceId = payload.workspaceId;
  }
  eventId: string;
  occurredOn: Date;
  formId: string;
  workspaceId: string;
}
