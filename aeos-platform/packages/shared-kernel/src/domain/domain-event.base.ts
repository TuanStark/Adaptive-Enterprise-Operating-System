// packages/shared-kernel/src/domain/domain-event.base.ts
// Domain Event = "Điều đã xảy ra" trong hệ thống.
// Mọi event đều có: eventId, aggregateId, occurredOn, eventType.

import { randomUUID } from 'crypto';

export abstract class DomainEvent {
  public readonly eventId: string;
  public readonly occurredOn: Date;
  public readonly aggregateId: string;
  public readonly eventType: string;

  constructor(aggregateId: string) {
    this.eventId = randomUUID();
    this.occurredOn = new Date();
    this.aggregateId = aggregateId;
    this.eventType = this.constructor.name;
  }

  /** Serialize event thành plain object (cho Outbox table / Kafka) */
  abstract toPayload(): Record<string, unknown>;
}
