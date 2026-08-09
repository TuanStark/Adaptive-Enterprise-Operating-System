import { PrismaService } from '@aeos/database';
import { Injectable } from '@nestjs/common';
import { Message } from '../../domain/entities/message.entity';
import { MessageRepository } from '../../domain/repositories/message.repository';
import { MessageReaction } from '../../domain/entities/message-reaction.entity';

@Injectable()
export class PrismaMessageRepository implements MessageRepository {
  constructor(private readonly prisma: PrismaService) {}

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
        },
        update: {
          content: message.content,
          isPinned: message.isPinned,
          isEdited: message.isEdited,
          editedAt: message.editedAt,
          deletedAt: message.deletedAt,
        },
      });

      await tx.messageReaction.deleteMany({ where: { messageId: message.id } });

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
    });
  }

  async findById(id: string): Promise<Message | null> {
    const record = await this.prisma.chatMessage.findUnique({
      where: { id },
      include: { reactions: true },
    });

    if (!record) return null;

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
      reactions: record.reactions.map((r) =>
        MessageReaction.fromPersistence({
          id: r.id,
          messageId: r.messageId,
          userId: r.userId,
          emoji: r.emoji,
          createdAt: r.createdAt,
        })
      ),
    });
  }

  async findByChannelId(
    channelId: string,
    cursor: string | null,
    limit: number
  ): Promise<{ data: Message[]; nextCursor: string | null }> {
    const records = await this.prisma.chatMessage.findMany({
      where: {
        channelId,
        parentMessageId: null,
        deletedAt: null,
      },
      include: { reactions: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    // Reverse to return chronological order
    records.reverse();

    const data = records.map((record) =>
      Message.fromPersistence({
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
        reactions: record.reactions.map((r) =>
          MessageReaction.fromPersistence({
            id: r.id,
            messageId: r.messageId,
            userId: r.userId,
            emoji: r.emoji,
            createdAt: r.createdAt,
          })
        ),
      })
    );

    const nextCursor = data.length >= limit ? data[data.length - 1].id : null;

    return { data, nextCursor };
  }

  async findThreadReplies(
    parentMessageId: string,
    cursor: string | null,
    limit: number
  ): Promise<{ data: Message[]; nextCursor: string | null }> {
    const records = await this.prisma.chatMessage.findMany({
      where: {
        parentMessageId,
        deletedAt: null,
      },
      include: { reactions: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    // Reverse to return chronological order
    records.reverse();

    const data = records.map((record) =>
      Message.fromPersistence({
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
        reactions: record.reactions.map((r) =>
          MessageReaction.fromPersistence({
            id: r.id,
            messageId: r.messageId,
            userId: r.userId,
            emoji: r.emoji,
            createdAt: r.createdAt,
          })
        ),
      })
    );

    const nextCursor = data.length >= limit ? data[data.length - 1].id : null;

    return { data, nextCursor };
  }

  async countThreadReplies(parentMessageId: string): Promise<number> {
    return this.prisma.chatMessage.count({
      where: { parentMessageId, deletedAt: null },
    });
  }
}
