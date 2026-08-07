import { Injectable } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { CommentRepository } from '../../domain/repositories/comment.repository';
import { Comment, CommentProps } from '../../domain/entities/comment.entity';
import { OutboxService } from '../../../../common/events/outbox.service';

@Injectable()
export class PrismaCommentRepository implements CommentRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outboxService: OutboxService,
  ) {}

  async save(comment: Comment): Promise<void> {
    const domainEvents = comment.pullDomainEvents();

    await this.prisma.$transaction(async (tx) => {
      await tx.taskComment.create({
        data: {
          id: comment.id,
          tenantId: comment.tenantId,
          taskId: comment.taskId,
          userId: comment.userId,
          content: comment.content,
        },
      });

      for (const event of domainEvents) {
        await this.outboxService.saveEvent(tx, {
          tenantId: comment.tenantId,
          aggregateType: 'Comment',
          aggregateId: comment.id,
          eventType: event.constructor.name,
          payload: typeof event.toPayload === 'function' ? event.toPayload() : {},
        });
      }
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
