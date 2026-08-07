import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { IIntegrationEvent, IIntegrationEventBus } from '@aeos/shared-kernel';

@Injectable()
export class InMemoryIntegrationEventBus implements IIntegrationEventBus {
  constructor(private readonly eventBus: EventBus) {}

  async publish(event: IIntegrationEvent): Promise<void> {
    // In a real Microservice, this would send to Kafka/RabbitMQ.
    // For Modular Monolith, we use the in-memory CQRS EventBus.
    this.eventBus.publish(event);
  }
}
