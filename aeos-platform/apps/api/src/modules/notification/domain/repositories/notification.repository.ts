import { Notification } from '../entities/notification.entity';

export interface NotificationRepository {
  save(notification: Notification): Promise<void>;
  findById(id: string): Promise<Notification | null>;
  findByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ data: Notification[]; total: number }>;
  markAllAsRead(userId: string): Promise<void>;
}

export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY');
