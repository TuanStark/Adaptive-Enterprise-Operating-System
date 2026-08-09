import { DomainEvent } from '@aeos/shared-kernel';

export class WorkspaceArchivedEvent extends DomainEvent {
  constructor(
    public readonly workspaceId: string,
    public readonly tenantId: string,
  ) {
    super(workspaceId);
  }

  toPayload(): Record<string, unknown> {
    return {
      workspaceId: this.workspaceId,
      tenantId: this.tenantId,
    };
  }
}
