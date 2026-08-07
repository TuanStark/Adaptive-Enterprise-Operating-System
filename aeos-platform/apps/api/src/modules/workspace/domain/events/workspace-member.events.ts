import { DomainEvent } from '@aeos/shared-kernel';
export class WorkspaceMemberAddedEvent extends DomainEvent {
  constructor(public readonly memberId: string, public readonly workspaceId: string) { super(memberId); }
  toPayload(): Record<string, unknown> { return { memberId: this.memberId, workspaceId: this.workspaceId }; }
}
export class WorkspaceMemberRemovedEvent extends DomainEvent {
  constructor(public readonly memberId: string, public readonly workspaceId: string) { super(memberId); }
  toPayload(): Record<string, unknown> { return { memberId: this.memberId, workspaceId: this.workspaceId }; }
}
