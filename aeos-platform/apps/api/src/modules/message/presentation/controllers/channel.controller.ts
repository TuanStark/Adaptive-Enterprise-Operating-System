import { Controller, Post, Get, Patch, Delete, Body, Param, Query, Req, HttpCode, HttpStatus, Inject, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { DomainError } from '@aeos/errors';
import { IsString, IsOptional, MaxLength, MinLength, IsEnum } from 'class-validator';
import { CreateChannelCommand } from '../../application/commands/create-channel/create-channel.command';
import { CreateChannelHandler } from '../../application/commands/create-channel/create-channel.handler';
import { JoinChannelCommand, JoinChannelHandler } from '../../application/commands/join-channel/join-channel.handler';
import { GetOrCreateDirectChannelCommand } from '../../application/commands/get-or-create-dm/get-or-create-dm.command';
import { GetOrCreateDirectChannelHandler } from '../../application/commands/get-or-create-dm/get-or-create-dm.handler';
import { ChannelRepository, CHANNEL_REPOSITORY } from '../../domain/repositories/channel.repository';
import { MessageRepository, MESSAGE_REPOSITORY } from '../../domain/repositories/message.repository';
import { ChatGateway } from '../gateways/chat.gateway';

// ── Request DTOs ──

class CreateChannelRequestDto {
  @IsString() tenantId!: string;
  @IsString() workspaceId!: string;
  @IsString() @MinLength(1) @MaxLength(80) name!: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() @MaxLength(250) description?: string;
}

class CreateDmRequestDto {
  @IsString() tenantId!: string;
  @IsString() workspaceId!: string;
  @IsString() targetUserId!: string;
}

class UpdateChannelRequestDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(80) name?: string;
  @IsOptional() @IsString() @MaxLength(250) topic?: string;
  @IsOptional() @IsString() @MaxLength(250) description?: string;
}

class AddMemberRequestDto {
  @IsString() userId!: string;
}

import { PrismaService } from '@aeos/database';

// ── Controller ──

@Controller('channels')
export class ChannelController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createChannelHandler: CreateChannelHandler,
    private readonly joinChannelHandler: JoinChannelHandler,
    private readonly getOrCreateDmHandler: GetOrCreateDirectChannelHandler,
    private readonly chatGateway: ChatGateway,
    @Inject(CHANNEL_REPOSITORY)
    private readonly channelRepository: ChannelRepository,
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: MessageRepository,
  ) {}

  // ── Channel CRUD ──

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createChannel(@Body() dto: CreateChannelRequestDto, @Req() req: Request) {
    const user = (req as any).user;
    const command = new CreateChannelCommand(
      dto.tenantId, dto.workspaceId, dto.name,
      user.userId, dto.type ?? 'PUBLIC', dto.description ?? null,
    );
    const result = await this.createChannelHandler.execute(command);
    if (result.isFail) throw result.error as DomainError;
    return { id: result.value, message: 'Channel created.' };
  }

  @Post('dm')
  @HttpCode(HttpStatus.OK)
  async createDirectMessage(@Body() dto: CreateDmRequestDto, @Req() req: Request) {
    const user = (req as any).user;
    const command = new GetOrCreateDirectChannelCommand(
      dto.tenantId, dto.workspaceId, user.userId, dto.targetUserId
    );
    const result = await this.getOrCreateDmHandler.execute(command);
    if (result.isFail) throw result.error as DomainError;
    return { id: result.value, message: 'DM channel ready.' };
  }

  @Get()
  async listChannels(
    @Query('workspaceId') workspaceId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Req() req?: Request,
  ) {
    const p = parseInt(page ?? '1', 10);
    const l = parseInt(limit ?? '50', 10);
    const user = (req as any)?.user;
    const userId = user?.userId;

    let { data, total } = await this.channelRepository.findByWorkspaceId(workspaceId, p, l, userId);

    if (total === 0 && workspaceId) {
      let creatorId = userId;
      if (!creatorId) {
        const firstUser = await this.prisma.user.findFirst({ select: { id: true } });
        creatorId = firstUser?.id;
      }

      if (creatorId) {
        const tenantId = user?.tenantId || 'default';
        const createCommand = new CreateChannelCommand(
          tenantId,
          workspaceId,
          'general',
          creatorId,
          'PUBLIC',
          'General discussion channel',
        );
        const createResult = await this.createChannelHandler.execute(createCommand);
        if (createResult.isOk) {
          const refreshed = await this.channelRepository.findByWorkspaceId(workspaceId, p, l, userId);
          data = refreshed.data;
          total = refreshed.total;
        }
      }
    }

    return {
      data: data.map(ch => ({
        id: ch.id, name: ch.name, type: ch.type, description: ch.description,
        topic: ch.topic, isArchived: ch.isArchived, memberCount: ch.members.length,
        members: ch.members.map(m => ({ userId: m.userId, role: m.role, joinedAt: m.joinedAt })),
        createdAt: ch.createdAt,
      })),
      meta: { page: p, limit: l, total, totalPages: Math.ceil(total / l) },
    };
  }

  @Get(':id')
  async getChannel(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    const channel = await this.channelRepository.findById(id);
    if (!channel) throw new Error('Channel not found');

    if (channel.type !== 'PUBLIC' && !channel.isMember(user.userId)) {
      throw new ForbiddenException('You do not have access to this channel.');
    }

    return {
      id: channel.id, name: channel.name, type: channel.type,
      description: channel.description, topic: channel.topic,
      isArchived: channel.isArchived,
      members: channel.members.map(m => ({ userId: m.userId, role: m.role, joinedAt: m.createdAt })),
      createdAt: channel.createdAt,
    };
  }

  @Patch(':id')
  async updateChannel(@Param('id') id: string, @Body() dto: UpdateChannelRequestDto) {
    const channel = await this.channelRepository.findById(id);
    if (!channel) throw new Error('Channel not found');

    if (dto.name) {
      const result = channel.rename(dto.name);
      if (result.isFail) throw result.error as DomainError;
    }
    if (dto.topic !== undefined) channel.setTopic(dto.topic || null);
    if (dto.description !== undefined) channel.setDescription(dto.description || null);

    await this.channelRepository.save(channel);
    return { message: 'Channel updated.' };
  }

  // ── Membership ──

  @Post(':id/read-cursor')
  async updateReadCursor(
    @Param('id') id: string,
    @Body() dto: { lastReadMessageId: string },
    @Req() req: Request
  ) {
    const user = (req as any).user;
    const channel = await this.channelRepository.findById(id);
    if (!channel) throw new Error('Channel not found');

    const result = channel.updateReadCursor(user.userId, dto.lastReadMessageId);
    if (result.isFail) throw result.error as DomainError;

    await this.channelRepository.save(channel);
    return { message: 'Read cursor updated.' };
  }

  @Post(':id/members')
  @HttpCode(HttpStatus.CREATED)
  async addMember(
    @Param('id') id: string,
    @Body() dto: AddMemberRequestDto,
    @Req() req: Request
  ) {
    const user = (req as any).user;
    const result = await this.joinChannelHandler.execute(new JoinChannelCommand(id, dto.userId, user.userId));
    if (result.isFail) throw result.error as DomainError;
    return { message: 'Member added.' };
  }

  @Delete(':id/members/:userId')
  async removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    const channel = await this.channelRepository.findById(id);
    if (!channel) throw new Error('Channel not found');
    const result = channel.removeMember(userId);
    if (result.isFail) throw result.error as DomainError;
    await this.channelRepository.save(channel);
    return { message: 'Member removed.' };
  }

  // ── Messages ──

  @Get(':id/messages')
  async listMessages(
    @Param('id') channelId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Req() req?: Request,
  ) {
    const l = parseInt(limit ?? '50', 10);
    const user = (req as any)?.user;
    
    if (user?.userId) {
      const channel = await this.channelRepository.findById(channelId);
      if (!channel) throw new Error('Channel not found');
      if (channel.type !== 'PUBLIC' && !channel.isMember(user.userId)) {
        throw new ForbiddenException('You do not have access to this channel.');
      }
    }

    const { data, nextCursor } = await this.messageRepository.findByChannelId(channelId, cursor ?? null, l);
    
    // Fetch read states for these messages
    let readStates: Record<string, Date> = {};
    if (user?.userId) {
      const threadIds = data.filter(m => m.replyCount > 0).map(m => m.id);
      readStates = await this.messageRepository.getThreadReadStates(threadIds, user.userId);
    }

    return {
      data: data.map(m => {
        const lastRead = readStates[m.id];
        const isThreadUnread = m.lastReplyAt && (!lastRead || new Date(m.lastReplyAt) > lastRead);

        return {
          id: m.id, channelId: m.channelId, senderId: m.senderId, content: m.content,
          parentMessageId: m.parentMessageId, isPinned: m.isPinned, isEdited: m.isEdited,
          replyCount: m.replyCount, lastReplyAt: m.lastReplyAt, isThreadUnread,
          reactions: m.reactions.map(r => ({ userId: r.userId, emoji: r.emoji })),
          createdAt: m.createdAt, editedAt: m.editedAt, deletedAt: m.deletedAt,
        };
      }),
      meta: { nextCursor },
    };
  }

  // Note: Mutation endpoints for messages (send, edit, delete, react)
  // have been moved to ChatGateway (WebSocket) for real-time performance.

  // ── Threads ──

  @Get(':channelId/messages/:msgId/thread')
  async getThread(
    @Param('channelId') channelId: string,
    @Param('msgId') msgId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Req() req?: Request,
  ) {
    const l = parseInt(limit ?? '50', 10);
    const user = (req as any)?.user;

    if (user?.userId) {
      const channel = await this.channelRepository.findById(channelId);
      if (!channel) throw new Error('Channel not found');
      if (channel.type !== 'PUBLIC' && !channel.isMember(user.userId)) {
        throw new ForbiddenException('You do not have access to this channel.');
      }
    }

    const { data, nextCursor } = await this.messageRepository.findThreadReplies(msgId, cursor ?? null, l);
    const threadCount = await this.messageRepository.countThreadReplies(msgId);
    return {
      data: data.map(m => ({
        id: m.id, channelId: m.channelId, senderId: m.senderId, content: m.content,
        parentMessageId: m.parentMessageId, isPinned: m.isPinned, isEdited: m.isEdited,
        reactions: m.reactions.map(r => ({ userId: r.userId, emoji: r.emoji })),
        createdAt: m.createdAt,
      })),
      meta: { nextCursor, threadCount },
    };
  }
}
