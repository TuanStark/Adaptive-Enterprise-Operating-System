export class GetDocumentAnalyticsInternalQuery {
  constructor(public readonly workspaceId: string) {}
}

export interface DocumentAnalyticsDto {
  totalDocuments: number;
}

import { IIntegrationEvent } from '@aeos/shared-kernel';
export class DocumentCreatedIntegrationEvent implements IIntegrationEvent {
  public static readonly EVENT_TYPE = 'DocumentCreatedEvent';
  constructor(payload: any) {
    this.eventId = payload.eventId || '';
    this.occurredOn = payload.occurredOn || new Date();
    this.documentId = payload.documentId;
    this.workspaceId = payload.workspaceId;
  }
  eventId: string;
  occurredOn: Date;
  documentId: string;
  workspaceId: string;
}
export class DocumentDeletedIntegrationEvent implements IIntegrationEvent {
  public static readonly EVENT_TYPE = 'DocumentDeletedEvent';
  constructor(payload: any) {
    this.eventId = payload.eventId || '';
    this.occurredOn = payload.occurredOn || new Date();
    this.documentId = payload.documentId;
    this.workspaceId = payload.workspaceId;
  }
  eventId: string;
  occurredOn: Date;
  documentId: string;
  workspaceId: string;
}
