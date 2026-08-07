import { DomainEvent } from '@aeos/shared-kernel';

export class WorkspaceMemberInvitedEvent extends DomainEvent {
  constructor(
    public readonly email: string,
    public readonly workspaceId: string,
    public readonly inviterId: string,
  ) {
    super(workspaceId);
  }

  toPayload(): Record<string, unknown> {
    return {
      email: this.email,
      workspaceId: this.workspaceId,
      inviterId: this.inviterId,
    };
  }
}
