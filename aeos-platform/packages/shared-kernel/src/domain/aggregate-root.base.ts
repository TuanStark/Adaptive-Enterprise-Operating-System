// packages/shared-kernel/src/domain/aggregate-root.base.ts
// AggregateRoot = Entity + Domain Events + Optimistic Locking (version).
// Mọi thay đổi nghiệp vụ đều đi qua Aggregate Root.

import { Entity } from './entity.base';
import { DomainEvent } from './domain-event.base';

export abstract class AggregateRoot<TId extends string = string> extends Entity<TId> {
  private _domainEvents: DomainEvent[] = [];
  private _version: number;

  constructor(id: TId, version: number = 0, createdAt?: Date, updatedAt?: Date) {
    super(id, createdAt, updatedAt);
    this._version = version;
  }

  get version(): number {
    return this._version;
  }

  /** Aggregate phát sinh Domain Event khi có thay đổi nghiệp vụ */
  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * Application Layer gọi sau khi persist thành công.
   * Lấy ra toàn bộ events và clear — đảm bảo không publish lại.
   */
  public pullDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents = [];
    return events;
  }

  /** Optimistic Locking — tăng version mỗi khi persist */
  public incrementVersion(): void {
    this._version++;
    this.touch();
  }
}
