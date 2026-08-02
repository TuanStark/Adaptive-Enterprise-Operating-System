import { Channel } from '../aggregates/channel.aggregate';

export interface ChannelRepository {
  save(channel: Channel): Promise<void>;
  findById(id: string): Promise<Channel | null>;
  findByWorkspaceId(workspaceId: string, page: number, limit: number): Promise<{ data: Channel[]; total: number }>;
  findByMemberUserId(userId: string): Promise<Channel[]>;
}

export const CHANNEL_REPOSITORY = Symbol('CHANNEL_REPOSITORY');
