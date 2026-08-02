import { Inject } from '@nestjs/common';
import { Result, DomainError, NotFoundError } from '@aeos/errors';
import { NotificationRepository, NOTIFICATION_REPOSITORY } from '../../../domain/repositories/notification.repository';

export class MarkAsReadCommand {
  constructor(public readonly notificationId: string) {}
}

export class MarkAsReadHandler {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(command: MarkAsReadCommand): Promise<Result<void, DomainError>> {
    const notification = await this.notificationRepository.findById(command.notificationId);
    if (!notification) return Result.fail(new NotFoundError('Notification', command.notificationId));

    notification.markAsRead();
    await this.notificationRepository.save(notification);
    return Result.ok(undefined);
  }
}
