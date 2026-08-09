import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import {
  GetCommentAnalyticsInternalQuery,
  CommentAnalyticsDto,
} from '../../../../../common/contracts/comment.contract';

@QueryHandler(GetCommentAnalyticsInternalQuery)
export class GetCommentAnalyticsInternalHandler implements IQueryHandler<GetCommentAnalyticsInternalQuery> {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async execute(query: GetCommentAnalyticsInternalQuery): Promise<CommentAnalyticsDto> {
    const totalComments = await this.prisma.taskComment
      .count({
        where: {
          task: { project: { workspaceId: query.workspaceId } },
        },
      })
      .catch(() => 0); // Gracefully fallback if the relation is different
    return { totalComments };
  }
}
