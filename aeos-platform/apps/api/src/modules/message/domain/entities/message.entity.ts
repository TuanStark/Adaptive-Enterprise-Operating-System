import { Entity } from '@aeos/shared-kernel';
import { Result } from '@aeos/errors';
import { generateId } from '@aeos/common';
import { MessageReaction } from './message-reaction.entity';
import { MessageContentRequiredError, MessageAlreadyDeletedError } from '../errors/message.errors';

export interface MessageProps {
  id: string;
  channelId: string;
  senderId: string;
  content: string;
  parentMessageId: string | null;
  isPinned: boolean;
  isEdited: boolean;
  editedAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  replyCount: number;
  lastReplyAt: Date | null;
  reactions: MessageReaction[];
  attachments: Array<{ id: string; url: string; name: string; type: string; size: number }>;
}

export class Message extends Entity<string> {
  private _channelId: string;
  private _senderId: string;
  private _content: string;
  private _parentMessageId: string | null;
  private _isPinned: boolean;
  private _isEdited: boolean;
  private _editedAt: Date | null;
  private _deletedAt: Date | null;
  private _replyCount: number;
  private _lastReplyAt: Date | null;
  private _reactions: MessageReaction[];
  private _attachments: Array<{
    id: string;
    url: string;
    name: string;
    type: string;
    size: number;
  }>;

  private constructor(props: MessageProps) {
    super(props.id, props.createdAt);
    this._channelId = props.channelId;
    this._senderId = props.senderId;
    this._content = props.content;
    this._parentMessageId = props.parentMessageId;
    this._isPinned = props.isPinned;
    this._isEdited = props.isEdited;
    this._editedAt = props.editedAt;
    this._deletedAt = props.deletedAt;
    this._replyCount = props.replyCount;
    this._lastReplyAt = props.lastReplyAt;
    this._reactions = props.reactions;
    this._attachments = props.attachments;
  }

  get channelId(): string {
    return this._channelId;
  }
  get senderId(): string {
    return this._senderId;
  }
  get content(): string {
    return this._content;
  }
  get parentMessageId(): string | null {
    return this._parentMessageId;
  }
  get isPinned(): boolean {
    return this._isPinned;
  }
  get isEdited(): boolean {
    return this._isEdited;
  }
  get editedAt(): Date | null {
    return this._editedAt;
  }
  get deletedAt(): Date | null {
    return this._deletedAt;
  }
  get replyCount(): number {
    return this._replyCount;
  }
  get lastReplyAt(): Date | null {
    return this._lastReplyAt;
  }
  get reactions(): ReadonlyArray<MessageReaction> {
    return this._reactions;
  }
  get attachments(): ReadonlyArray<{
    id: string;
    url: string;
    name: string;
    type: string;
    size: number;
  }> {
    return this._attachments;
  }

  static create(
    channelId: string,
    senderId: string,
    content: string,
    parentMessageId: string | null = null,
    attachmentIds: string[] = [],
  ): Result<Message, MessageContentRequiredError> {
    if ((!content || content.trim().length === 0) && attachmentIds.length === 0) {
      return Result.fail(new MessageContentRequiredError());
    }

    const message = new Message({
      id: generateId(),
      channelId,
      senderId,
      content: content.trim(),
      parentMessageId,
      isPinned: false,
      isEdited: false,
      editedAt: null,
      deletedAt: null,
      createdAt: new Date(),
      replyCount: 0,
      lastReplyAt: null,
      reactions: [],
      attachments: attachmentIds.map((id) => ({ id, url: '', name: '', type: '', size: 0 })), // Placeholder, domain shouldn't care
    });

    return Result.ok(message);
  }

  static fromPersistence(props: MessageProps): Message {
    return new Message(props);
  }

  edit(newContent: string): Result<void, MessageContentRequiredError | MessageAlreadyDeletedError> {
    if (this._deletedAt) {
      return Result.fail(new MessageAlreadyDeletedError());
    }
    if (!newContent || newContent.trim().length === 0) {
      return Result.fail(new MessageContentRequiredError());
    }
    this._content = newContent.trim();
    this._isEdited = true;
    this._editedAt = new Date();
    return Result.ok(undefined);
  }

  pin(): void {
    this._isPinned = true;
  }

  unpin(): void {
    this._isPinned = false;
  }

  softDelete(): Result<void, MessageAlreadyDeletedError> {
    if (this._deletedAt) {
      return Result.fail(new MessageAlreadyDeletedError());
    }
    this._deletedAt = new Date();
    return Result.ok(undefined);
  }

  updateReplyCount(count: number, lastReplyAt: Date | null): void {
    this._replyCount = count;
    this._lastReplyAt = lastReplyAt;
  }

  addReaction(userId: string, emoji: string): void {
    const existing = this._reactions.find((r) => r.userId === userId && r.emoji === emoji);
    if (!existing) {
      this._reactions.push(MessageReaction.create(this.id, userId, emoji));
    }
  }

  removeReaction(userId: string, emoji: string): void {
    this._reactions = this._reactions.filter((r) => !(r.userId === userId && r.emoji === emoji));
  }
}
