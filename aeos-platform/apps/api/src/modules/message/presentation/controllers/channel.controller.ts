import { Controller, Post, Get, Patch, Delete, Body, Param, Query, Req, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { Request } from 'express';
import { DomainError } from '@aeos/errors';
import { IsString, IsOptional, MaxLength, MinLength, IsEnum } from 'class-validator';
import { CreateChannelCommand } from '../../application/commands/create-channel/create-channel.command';
import { CreateChannelHandler } from '../../application/commands/create-channel/create-channel.handler';
import { SendMessageCommand } from '../../application/commands/send-message/send-message.command';
import { SendMessageHandler } from '../../application/commands/send-message/send-message.handler';
import { JoinChannelCommand, JoinChannelHandler } from '../../application/commands/join-channel/join-channel.handler';
import { ReactToMessageCommand, ReactToMessageHandler } from '../../application/commands/react-to-message/react-to-message.handler';
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

class UpdateChannelRequestDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(80) name?: string;
  @IsOptional() @IsString() @MaxLength(250) topic?: string;
  @IsOptional() @IsString() @MaxLength(250) description?: string;
}

class SendMessageRequestDto {
  @IsString() @MinLength(1) content!: string;
  @IsOptional() @IsString() parentMessageId?: string;
}

class AddMemberRequestDto {
  @IsString() userId!: string;
}

class ReactRequestDto {
  @IsString() emoji!: string;
}

import { PrismaService } from '@aeos/database';

// ── Controller ──

@Controller('channels')
export class ChannelController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createChannelHandler: CreateChannelHandler,
    private readonly sendMessageHandler: SendMessageHandler,
    private readonly joinChannelHandler: JoinChannelHandler,
    private readonly reactHandler: ReactToMessageHandler,
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

  @Get()
  async listChannels(
    @Query('workspaceId') workspaceId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Req() req?: Request,
  ) {
    const p = parseInt(page ?? '1', 10);
    const l = parseInt(limit ?? '50', 10);
    let { data, total } = await this.channelRepository.findByWorkspaceId(workspaceId, p, l);

    if (total === 0 && workspaceId) {
      const user = (req as any)?.user;
      let creatorId = user?.userId;
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
          const refreshed = await this.channelRepository.findByWorkspaceId(workspaceId, p, l);
          data = refreshed.data;
          total = refreshed.total;
        }
      }
    }

    return {
      data: data.map(ch => ({
        id: ch.id, name: ch.name, type: ch.type, description: ch.description,
        topic: ch.topic, isArchived: ch.isArchived, memberCount: ch.members.length,
        createdAt: ch.createdAt,
      })),
      meta: { page: p, limit: l, total, totalPages: Math.ceil(total / l) },
    };
  }

  @Get(':id')
  async getChannel(@Param('id') id: string) {
    const channel = await this.channelRepository.findById(id);
    if (!channel) throw new Error('Channel not found');
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

  @Post(':id/members')
  @HttpCode(HttpStatus.CREATED)
  async addMember(@Param('id') id: string, @Body() dto: AddMemberRequestDto) {
    const result = await this.joinChannelHandler.execute(new JoinChannelCommand(id, dto.userId));
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
  ) {
    const l = parseInt(limit ?? '50', 10);
    const { data, nextCursor } = await this.messageRepository.findByChannelId(channelId, cursor ?? null, l);
    return {
      data: data.map(m => ({
        id: m.id, channelId: m.channelId, senderId: m.senderId, content: m.content,
        parentMessageId: m.parentMessageId, isPinned: m.isPinned, isEdited: m.isEdited,
        reactions: m.reactions.map(r => ({ userId: r.userId, emoji: r.emoji })),
        createdAt: m.createdAt, editedAt: m.editedAt, deletedAt: m.deletedAt,
      })),
      meta: { nextCursor },
    };
  }

  @Post(':id/messages')
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(@Param('id') channelId: string, @Body() dto: SendMessageRequestDto, @Req() req: Request) {
    const user = (req as any).user;
    const command = new SendMessageCommand(
      channelId, user.userId, dto.content, dto.parentMessageId ?? null,
    );
    const result = await this.sendMessageHandler.execute(command);
    if (result.isFail) throw result.error as DomainError;
    return { id: result.value, message: 'Message sent.' };
  }

  @Patch(':channelId/messages/:msgId')
  async editMessage(
    @Param('channelId') channelId: string,
    @Param('msgId') msgId: string,
    @Body() dto: SendMessageRequestDto,
  ) {
    const message = await this.messageRepository.findById(msgId);
    if (!message) throw new Error('Message not found');
    const result = message.edit(dto.content);
    if (result.isFail) throw result.error as DomainError;
    await this.messageRepository.save(message);

    this.chatGateway.broadcastMessageEdited(
      channelId,
      msgId,
      dto.content,
      new Date().toISOString(),
    );

    return { message: 'Message edited.' };
  }

  @Delete(':channelId/messages/:msgId')
  async deleteMessage(
    @Param('channelId') channelId: string,
    @Param('msgId') msgId: string,
  ) {
    const message = await this.messageRepository.findById(msgId);
    if (!message) throw new Error('Message not found');
    const result = message.softDelete();
    if (result.isFail) throw result.error as DomainError;
    await this.messageRepository.save(message);

    this.chatGateway.broadcastMessageDeleted(channelId, msgId);

    return { message: 'Message deleted.' };
  }

  // ── Reactions ──

  @Post(':channelId/messages/:msgId/reactions')
  @HttpCode(HttpStatus.CREATED)
  async addReaction(
    @Param('channelId') channelId: string,
    @Param('msgId') msgId: string,
    @Body() dto: ReactRequestDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    const result = await this.reactHandler.execute(new ReactToMessageCommand(msgId, user.userId, dto.emoji));
    if (result.isFail) throw result.error as DomainError;

    const message = await this.messageRepository.findById(msgId);
    if (message) {
      this.chatGateway.broadcastReactionUpdated(
        channelId,
        msgId,
        message.reactions.map((r) => ({ userId: r.userId, emoji: r.emoji })),
      );
    }

    return { message: 'Reaction added.' };
  }

  @Delete(':channelId/messages/:msgId/reactions/:emoji')
  async removeReaction(
    @Param('channelId') channelId: string,
    @Param('msgId') msgId: string,
    @Param('emoji') emoji: string,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    const message = await this.messageRepository.findById(msgId);
    if (!message) throw new Error('Message not found');
    message.removeReaction(user.userId, emoji);
    await this.messageRepository.save(message);

    this.chatGateway.broadcastReactionUpdated(
      channelId,
      msgId,
      message.reactions.map((r) => ({ userId: r.userId, emoji: r.emoji })),
    );

    return { message: 'Reaction removed.' };
  }

  // ── Threads ──

  @Get(':channelId/messages/:msgId/thread')
  async getThread(
    @Param('msgId') msgId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const l = parseInt(limit ?? '50', 10);
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
