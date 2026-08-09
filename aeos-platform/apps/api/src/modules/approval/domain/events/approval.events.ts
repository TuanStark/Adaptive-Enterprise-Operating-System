import { DomainEvent } from '@aeos/shared-kernel';
export class ApprovalCreatedEvent extends DomainEvent {
  constructor(
    public readonly approvalId: string,
    public readonly workspaceId: string,
  ) {
    super(approvalId);
  }
  toPayload(): Record<string, unknown> {
    return { approvalId: this.approvalId, workspaceId: this.workspaceId };
  }
}
export class ApprovalDeletedEvent extends DomainEvent {
  constructor(
    public readonly approvalId: string,
    public readonly workspaceId: string,
  ) {
    super(approvalId);
  }
  toPayload(): Record<string, unknown> {
    return { approvalId: this.approvalId, workspaceId: this.workspaceId };
  }
}
