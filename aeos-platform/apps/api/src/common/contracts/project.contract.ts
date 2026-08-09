export class GetProjectAnalyticsInternalQuery {
  constructor(public readonly workspaceId: string) {}
}

export interface ProjectAnalyticsDto {
  totalProjects: number;
  activeProjects: number;
}

export class GetProjectWorkspaceInternalQuery {
  constructor(public readonly projectId: string) {}
}

export interface ProjectWorkspaceDto {
  workspaceId: string | null;
}

import { IIntegrationEvent } from '@aeos/shared-kernel';
export class ProjectDeletedIntegrationEvent implements IIntegrationEvent {
  public static readonly EVENT_TYPE = 'ProjectDeletedEvent';
  constructor(payload: any) {
    this.eventId = payload.eventId || '';
    this.occurredOn = payload.occurredOn || new Date();
    this.projectId = payload.projectId;
    this.workspaceId = payload.workspaceId;
  }
  eventId: string;
  occurredOn: Date;
  projectId: string;
  workspaceId: string;
}
export class ProjectCreatedIntegrationEvent implements IIntegrationEvent {
  public static readonly EVENT_TYPE = 'ProjectCreatedEvent';
  constructor(payload: any) {
    this.eventId = payload.eventId || '';
    this.occurredOn = payload.occurredOn || new Date();
    this.projectId = payload.projectId;
    this.workspaceId = payload.workspaceId;
  }
  eventId: string;
  occurredOn: Date;
  projectId: string;
  workspaceId: string;
}
