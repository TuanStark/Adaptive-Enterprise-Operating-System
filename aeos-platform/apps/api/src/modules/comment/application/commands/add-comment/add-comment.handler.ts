import { Inject } from '@nestjs/common';
import { Result, DomainError, ValidationError } from '@aeos/errors';
import { Comment } from '../../../domain/entities/comment.entity';
import { CommentRepository, COMMENT_REPOSITORY } from '../../../domain/repositories/comment.repository';

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
  ) {}

  async execute(command: AddCommentCommand): Promise<Result<{ id: string; content: string }, DomainError>> {
    if (!command.content || command.content.trim().length === 0) {
      return Result.fail(new ValidationError('Comment content is required.'));
    }

    const comment = Comment.create(command.tenantId, command.taskId, command.userId, command.content.trim());
    await this.commentRepository.save(comment);

    return Result.ok({ id: comment.id, content: comment.content });
  }
}
