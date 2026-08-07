import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EventsModule } from '../../common/events/events.module';
import { PrismaService } from '@aeos/database';
import { COMMENT_REPOSITORY } from './domain/repositories/comment.repository';
import { PrismaCommentRepository } from './infrastructure/persistence/prisma-comment.repository';
import { AddCommentHandler } from './application/commands/add-comment/add-comment.handler';
import { GetCommentsByTaskHandler } from './application/queries/get-comments-by-task/get-comments-by-task.handler';
import { CommentController } from './presentation/controllers/comment.controller';
import { GetCommentAnalyticsInternalHandler } from './application/queries/get-comment-analytics-internal/get-comment-analytics-internal.handler';

@Module({
  imports: [CqrsModule, EventsModule],
  controllers: [CommentController],
  providers: [
    PrismaService,
    { provide: COMMENT_REPOSITORY, useClass: PrismaCommentRepository },
    AddCommentHandler,
    GetCommentsByTaskHandler,
    GetCommentAnalyticsInternalHandler,
  ],
  exports: [COMMENT_REPOSITORY],
})
export class CommentModule {}
