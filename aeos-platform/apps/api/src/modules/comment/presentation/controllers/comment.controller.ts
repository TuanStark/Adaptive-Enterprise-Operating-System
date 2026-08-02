import { Controller, Post, Get, Body, Param, Req, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { Request } from 'express';
import { DomainError } from '@aeos/errors';
import { IsString, MinLength } from 'class-validator';
import { AddCommentCommand, AddCommentHandler } from '../../application/commands/add-comment/add-comment.handler';
import { CommentRepository, COMMENT_REPOSITORY } from '../../domain/repositories/comment.repository';

class AddCommentRequestDto {
  @IsString() tenantId!: string;
  @IsString() @MinLength(1) content!: string;
}

@Controller('tasks/:taskId/comments')
export class CommentController {
  constructor(
    private readonly addCommentHandler: AddCommentHandler,
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepository: CommentRepository,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async add(@Param('taskId') taskId: string, @Body() dto: AddCommentRequestDto, @Req() req: Request) {
    const user = (req as any).user;
    const command = new AddCommentCommand(dto.tenantId, taskId, user.userId, dto.content);
    const result = await this.addCommentHandler.execute(command);
    if (result.isFail) throw result.error as DomainError;
    return result.value;
  }

  @Get()
  async list(@Param('taskId') taskId: string) {
    const comments = await this.commentRepository.findByTaskId(taskId);
    return comments.map((c) => ({
      id: c.id, userId: c.userId, content: c.content, createdAt: c.createdAt,
    }));
  }
}
