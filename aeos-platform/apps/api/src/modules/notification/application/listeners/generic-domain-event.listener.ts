import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DomainEvent } from '../../../../common/events/outbox.processor';
import { CreateNotificationHandler, CreateNotificationCommand } from '../commands/create-notification/create-notification.handler';
import { NotificationRepository, NOTIFICATION_REPOSITORY } from '../../domain/repositories/notification.repository';

@EventsHandler(DomainEvent)
export class GenericDomainEventListener implements IEventHandler<DomainEvent> {
  constructor(
    private readonly createNotificationHandler: CreateNotificationHandler,
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async handle(event: DomainEvent) {
    if (event.eventType === 'TaskAssignedEvent') {
      const payload = event.payload as any;
      if (payload.assigneeId) {
        await this.createNotificationHandler.execute(
          new CreateNotificationCommand(
            payload.tenantId,
            payload.assigneeId,
            'TASK_ASSIGNED',
            'You have been assigned to a new task',
            payload.taskId,
          ),
        );
      }
    }
    // Handle other events...
  }
}
