import { Entity } from '@aeos/shared-kernel';
import { generateId } from '@aeos/common';

export interface MessageReactionProps {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
}

export class MessageReaction extends Entity<string> {
  private _messageId: string;
  private _userId: string;
  private _emoji: string;

  private constructor(props: MessageReactionProps) {
    super(props.id, props.createdAt);
    this._messageId = props.messageId;
    this._userId = props.userId;
    this._emoji = props.emoji;
  }

  get messageId(): string { return this._messageId; }
  get userId(): string { return this._userId; }
  get emoji(): string { return this._emoji; }

  static create(messageId: string, userId: string, emoji: string): MessageReaction {
    return new MessageReaction({
      id: generateId(), messageId, userId, emoji, createdAt: new Date(),
    });
  }

  static fromPersistence(props: MessageReactionProps): MessageReaction {
    return new MessageReaction(props);
  }
}
