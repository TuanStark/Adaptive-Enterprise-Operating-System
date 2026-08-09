import { Inject } from '@nestjs/common';
import { Result, DomainError } from '@aeos/errors';
import { Notification } from '../../../domain/entities/notification.entity';
import {
  NotificationRepository,
  NOTIFICATION_REPOSITORY,
} from '../../../domain/repositories/notification.repository';

export class CreateNotificationCommand {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly type: string,
    public readonly title: string,
    public readonly content: string | null = null,
    public readonly metadata: Record<string, any> | null = null,
  ) {}
}

export class CreateNotificationHandler {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(command: CreateNotificationCommand): Promise<Result<string, DomainError>> {
    const notification = Notification.create(
      command.tenantId,
      command.userId,
      command.type,
      command.title,
      command.content,
      command.metadata,
    );
    await this.notificationRepository.save(notification);
    return Result.ok(notification.id);
  }
}
