import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaService } from '@aeos/database';
import { COMMENT_REPOSITORY } from './domain/repositories/comment.repository';
import { PrismaCommentRepository } from './infrastructure/persistence/prisma-comment.repository';
import { AddCommentHandler } from './application/commands/add-comment/add-comment.handler';
import { GetCommentsByTaskHandler } from './application/queries/get-comments-by-task/get-comments-by-task.handler';
import { CommentController } from './presentation/controllers/comment.controller';

@Module({
  imports: [CqrsModule],
  controllers: [CommentController],
  providers: [
    PrismaService,
    { provide: COMMENT_REPOSITORY, useClass: PrismaCommentRepository },
    AddCommentHandler,
    GetCommentsByTaskHandler,
  ],
  exports: [COMMENT_REPOSITORY],
})
export class CommentModule {}
