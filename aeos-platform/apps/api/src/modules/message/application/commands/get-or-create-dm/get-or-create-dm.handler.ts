import { Inject } from '@nestjs/common';
import { Result, DomainError } from '@aeos/errors';
import { Channel, ChannelType } from '../../../domain/aggregates/channel.aggregate';
import {
  ChannelRepository,
  CHANNEL_REPOSITORY,
} from '../../../domain/repositories/channel.repository';
import { GetOrCreateDirectChannelCommand } from './get-or-create-dm.command';

export class GetOrCreateDirectChannelHandler {
  constructor(
    @Inject(CHANNEL_REPOSITORY)
    private readonly channelRepository: ChannelRepository,
  ) {}

  async execute(command: GetOrCreateDirectChannelCommand): Promise<Result<string, DomainError>> {
    const sortedIds = [command.currentUserId, command.targetUserId].sort();
    const channelName = `dm_${sortedIds[0]}_${sortedIds[1]}`;

    const existing = await this.channelRepository.findByNameAndWorkspaceId(
      channelName,
      command.workspaceId,
    );
    if (existing) {
      return Result.ok(existing.id);
    }

    const createResult = Channel.create(
      command.tenantId,
      command.workspaceId,
      channelName,
      command.currentUserId,
      ChannelType.DIRECT,
      'Direct message channel',
    );

    if (createResult.isFail) {
      return Result.fail(createResult.error);
    }

    const channel = createResult.value;
    if (command.currentUserId !== command.targetUserId) {
      const addResult = channel.addMember(command.targetUserId, 'MEMBER');
      if (addResult.isFail) {
        return Result.fail(addResult.error);
      }
    }

    await this.channelRepository.save(channel);

    return Result.ok(channel.id);
  }
}
