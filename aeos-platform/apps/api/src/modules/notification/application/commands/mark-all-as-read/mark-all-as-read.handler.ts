import { Inject } from '@nestjs/common';
import { Result, DomainError } from '@aeos/errors';
import { NotificationRepository, NOTIFICATION_REPOSITORY } from '../../../domain/repositories/notification.repository';

export class MarkAllAsReadCommand {
  constructor(public readonly userId: string) {}
}

export class MarkAllAsReadHandler {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(command: MarkAllAsReadCommand): Promise<Result<void, DomainError>> {
    await this.notificationRepository.markAllAsRead(command.userId);
    return Result.ok(undefined);
  }
}
