import { DomainError } from '@aeos/errors';

export class NotificationNotFoundError extends DomainError {
  constructor(id: string) {
    super('NOTIFICATION_NOT_FOUND', `Notification "${id}" not found.`, 404);
  }
}
