import { EventsHandler } from '@nestjs/cqrs';
import { PrismaService } from '@aeos/database';
import { IdempotentEventHandler } from '../../../../common/events/idempotent-event-handler';
import { TaskCreatedIntegrationEvent } from '../../../../common/contracts/task.contract';

@EventsHandler(TaskCreatedIntegrationEvent)
export class TaskCreatedNotificationHandler extends IdempotentEventHandler<TaskCreatedIntegrationEvent> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected async process(event: TaskCreatedIntegrationEvent): Promise<void> {
    this.logger.log(`[Notification Service] Processing TaskCreatedIntegrationEvent for Task: ${event.title}`);

    await new Promise((resolve) => setTimeout(resolve, 500));

    this.logger.log(`[Notification Service] Successfully sent notification for Task ${event.taskId} to Creator ${event.creatorId}.`);
  }
}
