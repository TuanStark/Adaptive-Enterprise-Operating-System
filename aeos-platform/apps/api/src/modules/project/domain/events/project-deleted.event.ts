import { DomainEvent } from '@aeos/shared-kernel';
export class ProjectDeletedEvent extends DomainEvent {
  constructor(
    public readonly projectId: string,
    public readonly workspaceId: string,
  ) {
    super(projectId);
  }
  toPayload(): Record<string, unknown> {
    return { projectId: this.projectId, workspaceId: this.workspaceId };
  }
}
