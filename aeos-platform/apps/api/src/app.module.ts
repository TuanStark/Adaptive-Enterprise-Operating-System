import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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
import { MeetingModule } from './modules/meeting/meeting.module';

@Module({
  imports: [
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
    MeetingModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
