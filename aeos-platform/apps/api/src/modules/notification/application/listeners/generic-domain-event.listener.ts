import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DomainEvent } from '@aeos/shared-kernel';
import {
  CreateNotificationHandler,
  CreateNotificationCommand,
} from '../commands/create-notification/create-notification.handler';
import {
  NotificationRepository,
  NOTIFICATION_REPOSITORY,
} from '../../domain/repositories/notification.repository';
import { TaskAssignedEvent } from '../../../task/domain/events/task.events';

@EventsHandler(DomainEvent)
export class GenericDomainEventListener implements IEventHandler<DomainEvent> {
  constructor(
    private readonly createNotificationHandler: CreateNotificationHandler,
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async handle(event: DomainEvent) {
    if (event instanceof TaskAssignedEvent) {
      if (event.assigneeId) {
        await this.createNotificationHandler.execute(
          new CreateNotificationCommand(
            event.tenantId,
            event.assigneeId,
            'TASK_ASSIGNED',
            'You have been assigned to a new task',
            event.taskId,
          ),
        );
      }
    }
    // Handle other events...
  }
}
