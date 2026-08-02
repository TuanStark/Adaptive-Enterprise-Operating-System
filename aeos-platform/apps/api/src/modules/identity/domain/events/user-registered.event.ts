import { DomainEvent } from '@aeos/shared-kernel';

export class UserRegisteredEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly tenantId: string,
  ) {
    super(userId);
  }

  toPayload(): Record<string, unknown> {
    return {
      userId: this.userId,
      email: this.email,
      tenantId: this.tenantId,
    };
  }
}
