import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaService } from '@aeos/database';
import { OutboxService } from './outbox.service';
import { OutboxProcessor, EventRegistry } from './outbox.processor';
import { INTEGRATION_EVENT_BUS } from '@aeos/shared-kernel';
import { InMemoryIntegrationEventBus } from './in-memory-integration-event-bus';
import { TaskCreatedIntegrationEvent } from '../contracts/task.contract';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CqrsModule,
  ],
  providers: [
    PrismaService,
    OutboxService,
    OutboxProcessor,
    {
      provide: INTEGRATION_EVENT_BUS,
      useClass: InMemoryIntegrationEventBus,
    },
  ],
  exports: [OutboxService, INTEGRATION_EVENT_BUS],
})
export class EventsModule {
  constructor() {
    EventRegistry.register(TaskCreatedIntegrationEvent.EVENT_TYPE, TaskCreatedIntegrationEvent);
  }
}
