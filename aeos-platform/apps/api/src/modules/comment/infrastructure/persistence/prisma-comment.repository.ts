import { Injectable } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { CommentRepository } from '../../domain/repositories/comment.repository';
import { Comment, CommentProps } from '../../domain/entities/comment.entity';

@Injectable()
export class PrismaCommentRepository implements CommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(comment: Comment): Promise<void> {
    await this.prisma.taskComment.create({
      data: {
        id: comment.id,
        tenantId: comment.tenantId,
        taskId: comment.taskId,
        userId: comment.userId,
        content: comment.content,
      },
    });
  }

  async findByTaskId(taskId: string): Promise<Comment[]> {
    const records = await this.prisma.taskComment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
    });
    return records.map((r) =>
      Comment.fromPersistence({
        id: r.id,
        tenantId: r.tenantId ?? '',
        taskId: r.taskId ?? '',
        userId: r.userId ?? '',
        content: r.content ?? '',
        createdAt: r.createdAt,
      }),
    );
  }
}
