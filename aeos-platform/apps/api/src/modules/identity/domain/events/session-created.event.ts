import { DomainEvent } from '@aeos/shared-kernel';

export class SessionCreatedEvent extends DomainEvent {
  constructor(
    public readonly sessionId: string,
    public readonly userId: string,
  ) {
    super(sessionId);
  }

  toPayload(): Record<string, unknown> {
    return { sessionId: this.sessionId, userId: this.userId };
  }
}
