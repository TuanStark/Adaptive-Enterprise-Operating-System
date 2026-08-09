import { Message } from '../entities/message.entity';

export interface MessageRepository {
  save(message: Message): Promise<void>;
  findById(id: string): Promise<Message | null>;
  findByChannelId(channelId: string, cursor: string | null, limit: number): Promise<{ data: Message[]; nextCursor: string | null }>;
  findThreadReplies(parentMessageId: string, cursor: string | null, limit: number): Promise<{ data: Message[]; nextCursor: string | null }>;
  countThreadReplies(parentMessageId: string): Promise<number>;
  markThreadAsRead(threadId: string, userId: string): Promise<void>;
  getThreadReadStates(threadIds: string[], userId: string): Promise<Record<string, Date>>;
}

export const MESSAGE_REPOSITORY = Symbol('MESSAGE_REPOSITORY');
