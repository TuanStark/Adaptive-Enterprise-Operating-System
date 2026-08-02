import { DomainEvent } from '@aeos/shared-kernel';

export class ProjectCreatedEvent extends DomainEvent {
  constructor(
    public readonly projectId: string,
    public readonly tenantId: string,
    public readonly workspaceId: string,
    public readonly name: string,
  ) {
    super(projectId);
  }

  toPayload(): Record<string, unknown> {
    return { projectId: this.projectId, tenantId: this.tenantId, workspaceId: this.workspaceId, name: this.name };
  }
}
