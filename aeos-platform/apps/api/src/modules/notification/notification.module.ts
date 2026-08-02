import { Module } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { NOTIFICATION_REPOSITORY } from './domain/repositories/notification.repository';
import { PrismaNotificationRepository } from './infrastructure/persistence/prisma-notification.repository';
import { CreateNotificationHandler } from './application/commands/create-notification/create-notification.handler';
import { MarkAsReadHandler } from './application/commands/mark-as-read/mark-as-read.handler';
import { MarkAllAsReadHandler } from './application/commands/mark-all-as-read/mark-all-as-read.handler';
import { NotificationController } from './presentation/controllers/notification.controller';

@Module({
  controllers: [NotificationController],
  providers: [
    PrismaService,
    { provide: NOTIFICATION_REPOSITORY, useClass: PrismaNotificationRepository },
    CreateNotificationHandler,
    MarkAsReadHandler,
    MarkAllAsReadHandler,
  ],
  exports: [NOTIFICATION_REPOSITORY, CreateNotificationHandler],
})
export class NotificationModule {}
