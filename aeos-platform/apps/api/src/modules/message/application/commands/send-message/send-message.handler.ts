import { Inject } from '@nestjs/common';
import { Result, DomainError } from '@aeos/errors';
import { Message } from '../../../domain/entities/message.entity';
import { ChannelRepository, CHANNEL_REPOSITORY } from '../../../domain/repositories/channel.repository';
import { MessageRepository, MESSAGE_REPOSITORY } from '../../../domain/repositories/message.repository';
import { ChannelNotFoundError, NotChannelMemberError, ChannelArchivedError } from '../../../domain/errors/message.errors';
import { SendMessageCommand } from './send-message.command';

import { ChannelType } from '../../../domain/aggregates/channel.aggregate';

export class SendMessageHandler {
  constructor(
    @Inject(CHANNEL_REPOSITORY)
    private readonly channelRepository: ChannelRepository,
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: MessageRepository,
  ) { }

  async execute(command: SendMessageCommand): Promise<Result<string, DomainError>> {
    const channel = await this.channelRepository.findById(command.channelId);
    if (!channel) return Result.fail(new ChannelNotFoundError(command.channelId));

    if (channel.isArchived) return Result.fail(new ChannelArchivedError());

    if (!channel.isMember(command.senderId)) {
      if (channel.type === ChannelType.PUBLIC) {
        channel.addMember(command.senderId);
        await this.channelRepository.save(channel);
      } else {
        return Result.fail(new NotChannelMemberError());
      }
    }

    const messageResult = Message.create(
      command.channelId,
      command.senderId,
      command.content,
      command.parentMessageId,
    );

    if (messageResult.isFail) return Result.fail(messageResult.error);

    const message = messageResult.value;
    await this.messageRepository.save(message);

    // Domain event would be dispatched by the infrastructure layer
    return Result.ok(message.id);
  }
}
