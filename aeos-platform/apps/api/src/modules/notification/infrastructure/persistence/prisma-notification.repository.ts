import { Injectable } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { NotificationRepository } from '../../domain/repositories/notification.repository';
import { Notification } from '../../domain/entities/notification.entity';

@Injectable()
export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(notification: Notification): Promise<void> {
    await this.prisma.notification.upsert({
      where: { id: notification.id },
      create: {
        id: notification.id,
        tenantId: notification.tenantId,
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        content: notification.content,
        read: notification.read,
        metadata: (notification.metadata as any) ?? undefined,
      },
      update: {
        read: notification.read,
      },
    });
  }

  async findById(id: string): Promise<Notification | null> {
    const record = await this.prisma.notification.findUnique({ where: { id } });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ data: Notification[]; total: number }> {
    const [records, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where: { userId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return { data: records.map(this.toDomain), total };
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  private toDomain(record: any): Notification {
    return Notification.fromPersistence({
      id: record.id,
      tenantId: record.tenantId ?? '',
      userId: record.userId ?? '',
      type: record.type ?? '',
      title: record.title ?? '',
      content: record.content,
      read: record.read,
      metadata: record.metadata,
      createdAt: record.createdAt,
    });
  }
}
