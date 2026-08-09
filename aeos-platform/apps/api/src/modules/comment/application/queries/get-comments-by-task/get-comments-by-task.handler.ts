import { Injectable, Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler, QueryBus } from '@nestjs/cqrs';
import {
  CommentRepository,
  COMMENT_REPOSITORY,
} from '../../../domain/repositories/comment.repository';
import { GetCommentsByTaskQuery } from './get-comments-by-task.query';
import {
  GetUsersInternalQuery,
  UserInternalDto,
} from '../../../../../common/contracts/identity.contract';

export interface CommentUserDto {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface CommentDetailDto {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  user?: CommentUserDto;
}

@QueryHandler(GetCommentsByTaskQuery)
@Injectable()
export class GetCommentsByTaskHandler implements IQueryHandler<GetCommentsByTaskQuery> {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepository: CommentRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(query: GetCommentsByTaskQuery): Promise<CommentDetailDto[]> {
    const comments = await this.commentRepository.findByTaskId(query.taskId);

    if (comments.length === 0) {
      return [];
    }

    const dtos: CommentDetailDto[] = comments.map((c) => ({
      id: c.id,
      userId: c.userId,
      content: c.content,
      createdAt: c.createdAt,
    }));

    // Extract unique user IDs
    const userIds = Array.from(new Set(dtos.map((c) => c.userId).filter(Boolean)));

    if (userIds.length > 0) {
      // Dispatch query to Identity module via QueryBus
      const users: UserInternalDto[] = await this.queryBus.execute(
        new GetUsersInternalQuery(userIds),
      );

      const userMap = new Map<string, CommentUserDto>();
      for (const u of users) {
        userMap.set(u.id, {
          id: u.id,
          displayName: [u.firstName, u.lastName].filter(Boolean).join(' ') || null,
          avatarUrl: u.avatarUrl,
        });
      }

      // Attach user object to each comment
      for (const dto of dtos) {
        if (dto.userId && userMap.has(dto.userId)) {
          dto.user = userMap.get(dto.userId);
        }
      }
    }

    return dtos;
  }
}
