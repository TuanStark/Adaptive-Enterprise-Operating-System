export class GetCommentAnalyticsInternalQuery {
  constructor(public readonly workspaceId: string) {}
}

export interface CommentAnalyticsDto {
  totalComments: number;
}

import { IIntegrationEvent } from '@aeos/shared-kernel';
export class CommentCreatedIntegrationEvent implements IIntegrationEvent {
  public static readonly EVENT_TYPE = 'CommentCreatedEvent';
  constructor(payload: any) {
    this.eventId = payload.eventId || '';
    this.occurredOn = payload.occurredOn || new Date();
    this.commentId = payload.commentId;
    this.workspaceId = payload.workspaceId;
  }
  eventId: string; occurredOn: Date; commentId: string; workspaceId: string;
}
export class CommentDeletedIntegrationEvent implements IIntegrationEvent {
  public static readonly EVENT_TYPE = 'CommentDeletedEvent';
  constructor(payload: any) {
    this.eventId = payload.eventId || '';
    this.occurredOn = payload.occurredOn || new Date();
    this.commentId = payload.commentId;
    this.workspaceId = payload.workspaceId;
  }
  eventId: string; occurredOn: Date; commentId: string; workspaceId: string;
}
