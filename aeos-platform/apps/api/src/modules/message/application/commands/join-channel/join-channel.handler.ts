import { Inject } from '@nestjs/common';
import { Result, DomainError } from '@aeos/errors';
import { ChannelRepository, CHANNEL_REPOSITORY } from '../../../domain/repositories/channel.repository';
import { ChannelNotFoundError } from '../../../domain/errors/message.errors';

export class JoinChannelCommand {
  constructor(
    public readonly channelId: string,
    public readonly userId: string,
  ) {}
}

export class JoinChannelHandler {
  constructor(
    @Inject(CHANNEL_REPOSITORY)
    private readonly channelRepository: ChannelRepository,
  ) {}

  async execute(command: JoinChannelCommand): Promise<Result<void, DomainError>> {
    const channel = await this.channelRepository.findById(command.channelId);
    if (!channel) return Result.fail(new ChannelNotFoundError(command.channelId));

    const result = channel.addMember(command.userId);
    if (result.isFail) return Result.fail(result.error);

    await this.channelRepository.save(channel);
    return Result.ok(undefined);
  }
}
