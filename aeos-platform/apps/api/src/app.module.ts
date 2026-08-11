import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import {
  appConfig,
  authConfig,
  cacheConfig,
  databaseConfig,
  kafkaConfig,
  mailConfig,
  observabilityConfig,
  storageConfig,
  validate,
} from './config';
import { HealthModule } from './health/health.module';
import { IdentityModule } from './modules/identity/identity.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { ProjectModule } from './modules/project/project.module';
import { SprintModule } from './modules/sprint/sprint.module';
import { TaskModule } from './modules/task/task.module';
import { CommentModule } from './modules/comment/comment.module';
import { NotificationModule } from './modules/notification/notification.module';
import { DocumentModule } from './modules/document/document.module';
import { FileModule } from './modules/file/file.module';
import { MeetingModule } from './modules/meeting/meeting.module';
import { ApprovalModule } from './modules/approval/approval.module';
import { FormModule } from './modules/form/form.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { MessageModule } from './modules/message/message.module';
import { EventsModule } from './common/events/events.module';
import { SearchModule } from './common/search/search.module';
import { MailModule } from './common/mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
      validate,
      load: [appConfig, authConfig, cacheConfig, databaseConfig, kafkaConfig, mailConfig, observabilityConfig, storageConfig],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),

    HealthModule,
    IdentityModule,
    OrganizationModule,
    WorkspaceModule,
    ProjectModule,
    SprintModule,
    TaskModule,
    CommentModule,
    NotificationModule,
    DocumentModule,
    FileModule,
    MeetingModule,
    ApprovalModule,
    FormModule,
    AnalyticsModule,
    MessageModule,
    EventsModule,
    SearchModule,
    MailModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
