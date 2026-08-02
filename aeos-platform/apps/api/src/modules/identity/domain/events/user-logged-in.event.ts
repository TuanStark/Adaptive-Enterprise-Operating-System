import { DomainEvent } from '@aeos/shared-kernel';

export class UserLoggedInEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly loginAt: Date,
  ) {
    super(userId);
  }

  toPayload(): Record<string, unknown> {
    return {
      userId: this.userId,
      email: this.email,
      loginAt: this.loginAt.toISOString(),
    };
  }
}
