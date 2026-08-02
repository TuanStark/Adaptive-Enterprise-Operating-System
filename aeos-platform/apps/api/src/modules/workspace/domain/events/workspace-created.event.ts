import { DomainEvent } from '@aeos/shared-kernel';

export class WorkspaceCreatedEvent extends DomainEvent {
  constructor(
    public readonly workspaceId: string,
    public readonly tenantId: string,
    public readonly organizationId: string,
    public readonly name: string,
    public readonly ownerId: string,
  ) {
    super(workspaceId);
  }

  toPayload(): Record<string, unknown> {
    return {
      workspaceId: this.workspaceId,
      tenantId: this.tenantId,
      organizationId: this.organizationId,
      name: this.name,
      ownerId: this.ownerId,
    };
  }
}
