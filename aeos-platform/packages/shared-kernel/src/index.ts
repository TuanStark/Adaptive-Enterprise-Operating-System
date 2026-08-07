// packages/shared-kernel/src/index.ts
// Public API của shared-kernel package

export { Entity } from './domain/entity.base';
export { AggregateRoot } from './domain/aggregate-root.base';
export { ValueObject } from './domain/value-object.base';
export { DomainEvent } from './domain/domain-event.base';
export { IRepository, IReadRepository } from './domain/repository.interface';
export { IIntegrationEvent } from './events/integration-event';
export { IIntegrationEventBus, INTEGRATION_EVENT_BUS } from './events/integration-event-bus.interface';
