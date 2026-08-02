import { DomainEvent } from '@aeos/shared-kernel';

export class SessionRevokedEvent extends DomainEvent {
  constructor(
    public readonly sessionId: string,
    public readonly userId: string,
    public readonly reason: string,
  ) {
    super(sessionId);
  }

  toPayload(): Record<string, unknown> {
    return { sessionId: this.sessionId, userId: this.userId, reason: this.reason };
  }
}
