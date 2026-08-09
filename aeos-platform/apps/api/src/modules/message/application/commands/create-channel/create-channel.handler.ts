import { Inject } from '@nestjs/common';
import { Result, DomainError } from '@aeos/errors';
import { Channel, ChannelType } from '../../../domain/aggregates/channel.aggregate';
import {
  ChannelRepository,
  CHANNEL_REPOSITORY,
} from '../../../domain/repositories/channel.repository';
import { CreateChannelCommand } from './create-channel.command';

export class CreateChannelHandler {
  constructor(
    @Inject(CHANNEL_REPOSITORY)
    private readonly channelRepository: ChannelRepository,
  ) {}

  async execute(command: CreateChannelCommand): Promise<Result<string, DomainError>> {
    const channelType = (command.type as ChannelType) ?? ChannelType.PUBLIC;

    const result = Channel.create(
      command.tenantId,
      command.workspaceId,
      command.name,
      command.creatorId,
      channelType,
      command.description,
    );

    if (result.isFail) return Result.fail(result.error);

    await this.channelRepository.save(result.value);
    return Result.ok(result.value.id);
  }
}
