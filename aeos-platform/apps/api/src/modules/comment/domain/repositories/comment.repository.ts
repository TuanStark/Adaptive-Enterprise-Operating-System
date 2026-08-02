import { Comment } from '../entities/comment.entity';

export interface CommentRepository {
  save(comment: Comment): Promise<void>;
  findByTaskId(taskId: string): Promise<Comment[]>;
}

export const COMMENT_REPOSITORY = Symbol('COMMENT_REPOSITORY');
