import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaService } from '@aeos/database';
import { MailModule } from '../../common/mail/mail.module';
import { NOTIFICATION_REPOSITORY } from './domain/repositories/notification.repository';
import { PrismaNotificationRepository } from './infrastructure/persistence/prisma-notification.repository';
import { CreateNotificationHandler } from './application/commands/create-notification/create-notification.handler';
import { MarkAsReadHandler } from './application/commands/mark-as-read/mark-as-read.handler';
import { MarkAllAsReadHandler } from './application/commands/mark-all-as-read/mark-all-as-read.handler';
import { GenericDomainEventListener } from './application/listeners/generic-domain-event.listener';
import { TaskCreatedNotificationHandler } from './application/events/task-created-notification.handler';
import { WorkspaceMemberInvitedNotificationHandler } from './application/events/workspace-member-invited.handler';
import { NotificationController } from './presentation/controllers/notification.controller';

@Module({
  imports: [CqrsModule, MailModule],
  controllers: [NotificationController],
  providers: [
    PrismaService,
    { provide: NOTIFICATION_REPOSITORY, useClass: PrismaNotificationRepository },
    CreateNotificationHandler,
    MarkAsReadHandler,
    MarkAllAsReadHandler,
    GenericDomainEventListener,
    TaskCreatedNotificationHandler,
    WorkspaceMemberInvitedNotificationHandler,
  ],
  exports: [NOTIFICATION_REPOSITORY, CreateNotificationHandler],
})
export class NotificationModule {}
