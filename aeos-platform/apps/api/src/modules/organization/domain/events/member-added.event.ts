import { DomainEvent } from '@aeos/shared-kernel';

export class MemberAddedEvent extends DomainEvent {
  constructor(
    public readonly organizationId: string,
    public readonly userId: string,
    public readonly role: string,
  ) {
    super(organizationId);
  }

  toPayload(): Record<string, unknown> {
    return {
      organizationId: this.organizationId,
      userId: this.userId,
      role: this.role,
    };
  }
}
