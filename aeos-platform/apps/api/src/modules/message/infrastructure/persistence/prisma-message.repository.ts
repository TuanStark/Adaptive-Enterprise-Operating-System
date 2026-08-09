import { PrismaService } from '@aeos/database';
import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Message } from '../../domain/entities/message.entity';
import { MessageRepository } from '../../domain/repositories/message.repository';
import { MessageReaction } from '../../domain/entities/message-reaction.entity';
import { GetFilesDetailsQuery } from '../../../file/application/queries/get-files-details/get-files-details.query';

@Injectable()
export class PrismaMessageRepository implements MessageRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queryBus: QueryBus,
  ) {}

  async save(message: Message): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.chatMessage.upsert({
        where: { id: message.id },
        create: {
          id: message.id,
          channelId: message.channelId,
          senderId: message.senderId,
          content: message.content,
          parentMessageId: message.parentMessageId,
          isPinned: message.isPinned,
          isEdited: message.isEdited,
          editedAt: message.editedAt,
          deletedAt: message.deletedAt,
          createdAt: message.createdAt,
          replyCount: message.replyCount,
          lastReplyAt: message.lastReplyAt,
        },
        update: {
          content: message.content,
          isPinned: message.isPinned,
          isEdited: message.isEdited,
          editedAt: message.editedAt,
          deletedAt: message.deletedAt,
          replyCount: message.replyCount,
          lastReplyAt: message.lastReplyAt,
        },
      });

      await tx.messageReaction.deleteMany({ where: { messageId: message.id } });
      await tx.messageAttachment.deleteMany({ where: { messageId: message.id } });

      if (message.reactions.length > 0) {
        await tx.messageReaction.createMany({
          data: message.reactions.map((r) => ({
            id: r.id,
            messageId: message.id,
            userId: r.userId,
            emoji: r.emoji,
            createdAt: r.createdAt,
          })),
        });
      }

      if (message.attachments.length > 0) {
        await tx.messageAttachment.createMany({
          data: message.attachments.map((a) => ({
            messageId: message.id,
            fileId: a.id,
          })),
          skipDuplicates: true,
        });
      }
    });
  }

  private async resolveAttachments(attachments: { fileId: string }[]): Promise<any[]> {
    if (!attachments || attachments.length === 0) return [];

    const fileIds = attachments.map((a) => a.fileId);
    const result = await this.queryBus.execute(new GetFilesDetailsQuery(fileIds));

    if (result && result.isOk) {
      return result.value;
    }
    return fileIds.map((id) => ({
      id,
      url: '',
      name: 'Unknown File',
      type: 'application/octet-stream',
      size: 0,
    }));
  }

  async findById(id: string): Promise<Message | null> {
    const record = await this.prisma.chatMessage.findUnique({
      where: { id },
      include: { reactions: true, attachments: true },
    });

    if (!record) return null;

    const resolvedAttachments = await this.resolveAttachments(record.attachments);

    return Message.fromPersistence({
      id: record.id,
      channelId: record.channelId,
      senderId: record.senderId,
      content: record.content,
      parentMessageId: record.parentMessageId,
      isPinned: record.isPinned,
      isEdited: record.isEdited,
      editedAt: record.editedAt,
      deletedAt: record.deletedAt,
      createdAt: record.createdAt,
      replyCount: record.replyCount,
      lastReplyAt: record.lastReplyAt,
      reactions: record.reactions.map((r) =>
        MessageReaction.fromPersistence({
          id: r.id,
          messageId: r.messageId,
          userId: r.userId,
          emoji: r.emoji,
          createdAt: r.createdAt,
        }),
      ),
      attachments: resolvedAttachments,
    });
  }

  async findByChannelId(
    channelId: string,
    cursor: string | null,
    limit: number,
  ): Promise<{ data: Message[]; nextCursor: string | null }> {
    const records = await this.prisma.chatMessage.findMany({
      where: {
        channelId,
        parentMessageId: null,
        deletedAt: null,
      },
      include: { reactions: true, attachments: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const data = await Promise.all(
      records.map(async (record) => {
        const resolvedAttachments = await this.resolveAttachments(record.attachments);
        return Message.fromPersistence({
          id: record.id,
          channelId: record.channelId,
          senderId: record.senderId,
          content: record.content,
          parentMessageId: record.parentMessageId,
          isPinned: record.isPinned,
          isEdited: record.isEdited,
          editedAt: record.editedAt,
          deletedAt: record.deletedAt,
          createdAt: record.createdAt,
          replyCount: record.replyCount,
          lastReplyAt: record.lastReplyAt,
          reactions: record.reactions.map((r) =>
            MessageReaction.fromPersistence({
              id: r.id,
              messageId: r.messageId,
              userId: r.userId,
              emoji: r.emoji,
              createdAt: r.createdAt,
            }),
          ),
          attachments: resolvedAttachments,
        });
      }),
    );

    const nextCursor = data.length >= limit ? data[data.length - 1].id : null;

    return { data, nextCursor };
  }

  async findThreadReplies(
    parentMessageId: string,
    cursor: string | null,
    limit: number,
  ): Promise<{ data: Message[]; nextCursor: string | null }> {
    const records = await this.prisma.chatMessage.findMany({
      where: {
        parentMessageId,
        deletedAt: null,
      },
      include: { reactions: true, attachments: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const data = await Promise.all(
      records.map(async (record) => {
        const resolvedAttachments = await this.resolveAttachments(record.attachments);
        return Message.fromPersistence({
          id: record.id,
          channelId: record.channelId,
          senderId: record.senderId,
          content: record.content,
          parentMessageId: record.parentMessageId,
          isPinned: record.isPinned,
          isEdited: record.isEdited,
          editedAt: record.editedAt,
          deletedAt: record.deletedAt,
          createdAt: record.createdAt,
          replyCount: record.replyCount,
          lastReplyAt: record.lastReplyAt,
          reactions: record.reactions.map((r) =>
            MessageReaction.fromPersistence({
              id: r.id,
              messageId: r.messageId,
              userId: r.userId,
              emoji: r.emoji,
              createdAt: r.createdAt,
            }),
          ),
          attachments: resolvedAttachments,
        });
      }),
    );

    const nextCursor = data.length >= limit ? data[data.length - 1].id : null;

    return { data, nextCursor };
  }

  async countThreadReplies(parentMessageId: string): Promise<number> {
    return this.prisma.chatMessage.count({
      where: { parentMessageId, deletedAt: null },
    });
  }

  async markThreadAsRead(threadId: string, userId: string): Promise<void> {
    await this.prisma.threadParticipant.upsert({
      where: {
        threadId_userId: {
          threadId,
          userId,
        },
      },
      create: {
        threadId,
        userId,
        lastReadAt: new Date(),
      },
      update: {
        lastReadAt: new Date(),
      },
    });
  }

  async getThreadReadStates(threadIds: string[], userId: string): Promise<Record<string, Date>> {
    if (threadIds.length === 0) return {};

    const records = await this.prisma.threadParticipant.findMany({
      where: {
        userId,
        threadId: { in: threadIds },
      },
    });

    const result: Record<string, Date> = {};
    for (const record of records) {
      result[record.threadId] = record.lastReadAt;
    }
    return result;
  }
}
