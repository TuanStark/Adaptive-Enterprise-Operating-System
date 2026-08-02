import { DomainEvent } from '@aeos/shared-kernel';

export class ChannelCreatedEvent extends DomainEvent {
  constructor(
    public readonly channelId: string,
    public readonly workspaceId: string,
    public readonly name: string,
  ) {
    super(channelId);
  }

  toPayload() {
    return { channelId: this.channelId, workspaceId: this.workspaceId, name: this.name };
  }
}

export class MessageSentEvent extends DomainEvent {
  constructor(
    public readonly messageId: string,
    public readonly channelId: string,
    public readonly senderId: string,
  ) {
    super(messageId);
  }

  toPayload() {
    return { messageId: this.messageId, channelId: this.channelId, senderId: this.senderId };
  }
}

export class MemberJoinedChannelEvent extends DomainEvent {
  constructor(
    public readonly channelId: string,
    public readonly userId: string,
  ) {
    super(channelId);
  }

  toPayload() {
    return { channelId: this.channelId, userId: this.userId };
  }
}

export class MemberLeftChannelEvent extends DomainEvent {
  constructor(
    public readonly channelId: string,
    public readonly userId: string,
  ) {
    super(channelId);
  }

  toPayload() {
    return { channelId: this.channelId, userId: this.userId };
  }
}
