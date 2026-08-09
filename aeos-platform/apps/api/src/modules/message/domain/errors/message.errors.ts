import { DomainError } from '@aeos/errors';

export class ChannelNotFoundError extends DomainError {
  constructor(channelId: string) {
    super('CHANNEL_NOT_FOUND', `Channel with id '${channelId}' not found.`, 404);
  }
}

export class ChannelNameRequiredError extends DomainError {
  constructor() {
    super('CHANNEL_NAME_REQUIRED', 'Channel name is required and cannot be empty.', 400);
  }
}

export class ChannelMemberAlreadyExistsError extends DomainError {
  constructor(userId: string) {
    super(
      'CHANNEL_MEMBER_ALREADY_EXISTS',
      `User '${userId}' is already a member of this channel.`,
      400,
    );
  }
}

export class ChannelMemberNotFoundError extends DomainError {
  constructor(userId: string) {
    super('CHANNEL_MEMBER_NOT_FOUND', `User '${userId}' is not a member of this channel.`, 404);
  }
}

export class MessageNotFoundError extends DomainError {
  constructor(messageId: string) {
    super('MESSAGE_NOT_FOUND', `Message with id '${messageId}' was not found.`, 404);
  }
}

export class MessageContentRequiredError extends DomainError {
  constructor() {
    super('MESSAGE_CONTENT_REQUIRED', 'Message content is required and cannot be empty.', 400);
  }
}

export class MessageAlreadyDeletedError extends DomainError {
  constructor() {
    super('MESSAGE_ALREADY_DELETED', 'This message has already been deleted.', 400);
  }
}

export class NotChannelMemberError extends DomainError {
  constructor() {
    super(
      'NOT_CHANNEL_MEMBER',
      'You must be a member of this channel to perform this action.',
      403,
    );
  }
}

export class ChannelArchivedError extends DomainError {
  constructor() {
    super('CHANNEL_ARCHIVED', 'This channel has been archived. No new messages can be sent.', 400);
  }
}
