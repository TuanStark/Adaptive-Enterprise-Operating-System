import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaService } from '@aeos/database';
import { OutboxService } from './outbox.service';
import { OutboxProcessor, EventRegistry } from './outbox.processor';
import { INTEGRATION_EVENT_BUS } from '@aeos/shared-kernel';
import { InMemoryIntegrationEventBus } from './in-memory-integration-event-bus';
import { TaskCreatedIntegrationEvent, TaskDeletedIntegrationEvent } from '../contracts/task.contract';
import { ProjectCreatedIntegrationEvent, ProjectDeletedIntegrationEvent } from '../contracts/project.contract';
import { DocumentCreatedIntegrationEvent, DocumentDeletedIntegrationEvent } from '../contracts/document.contract';
import { FormCreatedIntegrationEvent, FormDeletedIntegrationEvent } from '../contracts/form.contract';
import { ApprovalCreatedIntegrationEvent, ApprovalDeletedIntegrationEvent } from '../contracts/approval.contract';
import { CommentCreatedIntegrationEvent, CommentDeletedIntegrationEvent } from '../contracts/comment.contract';
import { WorkspaceMemberAddedIntegrationEvent, WorkspaceMemberRemovedIntegrationEvent } from '../contracts/workspace.contract';

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
    EventRegistry.register(TaskDeletedIntegrationEvent.EVENT_TYPE, TaskDeletedIntegrationEvent);
    EventRegistry.register(ProjectCreatedIntegrationEvent.EVENT_TYPE, ProjectCreatedIntegrationEvent);
    EventRegistry.register(ProjectDeletedIntegrationEvent.EVENT_TYPE, ProjectDeletedIntegrationEvent);
    EventRegistry.register(DocumentCreatedIntegrationEvent.EVENT_TYPE, DocumentCreatedIntegrationEvent);
    EventRegistry.register(DocumentDeletedIntegrationEvent.EVENT_TYPE, DocumentDeletedIntegrationEvent);
    EventRegistry.register(FormCreatedIntegrationEvent.EVENT_TYPE, FormCreatedIntegrationEvent);
    EventRegistry.register(FormDeletedIntegrationEvent.EVENT_TYPE, FormDeletedIntegrationEvent);
    EventRegistry.register(ApprovalCreatedIntegrationEvent.EVENT_TYPE, ApprovalCreatedIntegrationEvent);
    EventRegistry.register(ApprovalDeletedIntegrationEvent.EVENT_TYPE, ApprovalDeletedIntegrationEvent);
    EventRegistry.register(CommentCreatedIntegrationEvent.EVENT_TYPE, CommentCreatedIntegrationEvent);
    EventRegistry.register(CommentDeletedIntegrationEvent.EVENT_TYPE, CommentDeletedIntegrationEvent);
    EventRegistry.register(WorkspaceMemberAddedIntegrationEvent.EVENT_TYPE, WorkspaceMemberAddedIntegrationEvent);
    EventRegistry.register(WorkspaceMemberRemovedIntegrationEvent.EVENT_TYPE, WorkspaceMemberRemovedIntegrationEvent);
  }
}
