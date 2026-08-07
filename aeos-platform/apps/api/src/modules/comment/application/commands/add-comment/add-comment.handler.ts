import { Inject } from '@nestjs/common';
import { Result, DomainError, ValidationError } from '@aeos/errors';
import { Comment } from '../../../domain/entities/comment.entity';
import { CommentRepository, COMMENT_REPOSITORY } from '../../../domain/repositories/comment.repository';
import { PrismaService } from '@aeos/database';

export class AddCommentCommand {
  constructor(
    public readonly tenantId: string,
    public readonly taskId: string,
    public readonly userId: string,
    public readonly content: string,
  ) {}
}

export class AddCommentHandler {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepository: CommentRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: AddCommentCommand): Promise<Result<{ id: string; content: string }, DomainError>> {
    if (!command.content || command.content.trim().length === 0) {
      return Result.fail(new ValidationError('Comment content is required.'));
    }

    const task = await this.prisma.task.findUnique({
      where: { id: command.taskId },
      select: { workspaceId: true },
    });
    
    if (!task || !task.workspaceId) {
      return Result.fail(new ValidationError('Task or workspace not found'));
    }

    const comment = Comment.create(command.tenantId, command.taskId, command.userId, command.content.trim(), task.workspaceId);
    await this.commentRepository.save(comment);

    return Result.ok({ id: comment.id, content: comment.content });
  }
}
