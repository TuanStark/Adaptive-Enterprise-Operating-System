import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject } from '@nestjs/common';
import { SendMessageCommand } from '../../application/commands/send-message/send-message.command';
import { SendMessageHandler } from '../../application/commands/send-message/send-message.handler';
import { ReactToMessageCommand, ReactToMessageHandler } from '../../application/commands/react-to-message/react-to-message.handler';
import { MessageRepository, MESSAGE_REPOSITORY } from '../../domain/repositories/message.repository';
import { ChannelRepository, CHANNEL_REPOSITORY } from '../../domain/repositories/channel.repository';
import { JWT_TOKEN_SERVICE, JwtTokenService } from '../../../identity/infrastructure/auth/jwt-token.service';

interface TypingPayload {
  channelId: string;
  userId: string;
  userName: string;
}

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private connectedUsers = new Map<string, { socketId: string; userId: string }>();

  constructor(
    private readonly sendMessageHandler: SendMessageHandler,
    private readonly reactHandler: ReactToMessageHandler,
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: MessageRepository,
    @Inject(CHANNEL_REPOSITORY)
    private readonly channelRepository: ChannelRepository,
    @Inject(JWT_TOKEN_SERVICE)
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const authHeader = client.handshake.auth?.token || client.handshake.headers?.authorization;
      const token = authHeader?.replace(/^Bearer\s+/i, '') || (client.handshake.query?.token as string);
      const queryUserId = client.handshake.query?.userId as string;

      let userId: string | undefined = queryUserId;

      if (token) {
        try {
          const payload = await this.jwtTokenService.verifyAccessToken(token);
          if (payload?.userId) {
            userId = payload.userId;
          }
        } catch (err) {
          console.warn(`[ChatGateway] Token verify failed for ${client.id}, falling back to query userId`, err);
        }
      }

      if (userId) {
        this.connectedUsers.set(client.id, { socketId: client.id, userId });
        console.log(`[ChatGateway] Socket connected: ${client.id} for user ${userId}`);
      } else {
        console.warn(`[ChatGateway] Disconnecting unauthenticated socket ${client.id}`);
        client.disconnect(true);
      }
    } catch (err) {
      console.error(`[ChatGateway] Socket connection error for ${client.id}:`, err);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`[ChatGateway] Socket disconnected: ${client.id}`);
    this.connectedUsers.delete(client.id);
  }

  @SubscribeMessage('channel:join')
  async handleJoinChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: string },
  ) {
    if (data?.channelId) {
      const userId = this.connectedUsers.get(client.id)?.userId || (client.handshake.query?.userId as string);
      const channel = await this.channelRepository.findById(data.channelId);
      
      if (!channel) {
        return { event: 'channel:join_failed', data: { channelId: data.channelId, reason: 'Channel not found' } };
      }

      if (channel.type !== 'PUBLIC' && !channel.isMember(userId)) {
        console.warn(`[ChatGateway] Socket ${client.id} unauthorized join attempt to channel:${data.channelId}`);
        return { event: 'channel:join_failed', data: { channelId: data.channelId, reason: 'Unauthorized' } };
      }

      client.join(`channel:${data.channelId}`);
      console.log(`[ChatGateway] Socket ${client.id} joined channel:${data.channelId}`);
    }
    return { event: 'channel:joined', data: { channelId: data?.channelId } };
  }

  @SubscribeMessage('channel:leave')
  handleLeaveChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: string },
  ) {
    if (data?.channelId) {
      client.leave(`channel:${data.channelId}`);
    }
    return { event: 'channel:left', data: { channelId: data?.channelId } };
  }

  @SubscribeMessage('workspace:join')
  handleJoinWorkspace(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { workspaceId: string },
  ) {
    if (data?.workspaceId) {
      client.join(`workspace:${data.workspaceId}`);
      console.log(`[ChatGateway] Socket ${client.id} joined workspace:${data.workspaceId}`);
    }
    return { event: 'workspace:joined', data: { workspaceId: data?.workspaceId } };
  }

  @SubscribeMessage('workspace:leave')
  handleLeaveWorkspace(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { workspaceId: string },
  ) {
    if (data?.workspaceId) {
      client.leave(`workspace:${data.workspaceId}`);
    }
    return { event: 'workspace:left', data: { workspaceId: data?.workspaceId } };
  }

  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: string; content: string; parentMessageId?: string },
  ) {
    const userId = this.connectedUsers.get(client.id)?.userId || (client.handshake.query?.userId as string);
    if (!userId) {
      console.warn(`[ChatGateway] Message reject: Not authenticated for socket ${client.id}`);
      return { status: 'error', message: 'Not authenticated' };
    }

    if (!data?.channelId || !data?.content) {
      return { status: 'error', message: 'Channel ID and content are required' };
    }

    const command = new SendMessageCommand(
      data.channelId,
      userId,
      data.content,
      data.parentMessageId ?? null,
    );

    const result = await this.sendMessageHandler.execute(command);
    if (result.isFail) {
      console.error(`[ChatGateway] Failed to send message: ${result.error}`);
      return { status: 'error', message: String(result.error) };
    }

    const messagePayload = {
      id: result.value,
      channelId: data.channelId,
      senderId: userId,
      content: data.content,
      parentMessageId: data.parentMessageId ?? null,
      isPinned: false,
      isEdited: false,
      reactions: [],
      createdAt: new Date().toISOString(),
      editedAt: null,
      deletedAt: null,
    };

    console.log(`[ChatGateway] Broadcasting message ${result.value} to channel:${data.channelId}`);
    client.to(`channel:${data.channelId}`).emit('message:received', messagePayload);

    return { status: 'success', data: { id: result.value } };
  }

  @SubscribeMessage('message:edit')
  async handleEditMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: string; messageId: string; content: string },
  ) {
    const userId = this.connectedUsers.get(client.id)?.userId;
    if (!userId) return { status: 'error', message: 'Not authenticated' };
    if (!data.messageId) return { status: 'error', message: 'Message ID is required' };

    const message = await this.messageRepository.findById(data.messageId);
    if (!message) return { status: 'error', message: 'Message not found' };

    const result = message.edit(data.content);
    if (result.isFail) return { status: 'error', message: String(result.error) };

    await this.messageRepository.save(message);

    const editedAt = new Date().toISOString();
    this.broadcastMessageEdited(data.channelId, data.messageId, data.content, editedAt);

    return { status: 'success', data: { id: data.messageId, editedAt } };
  }

  @SubscribeMessage('message:delete')
  async handleDeleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: string; messageId: string },
  ) {
    const userId = this.connectedUsers.get(client.id)?.userId;
    if (!userId) return { status: 'error', message: 'Not authenticated' };
    if (!data.messageId) return { status: 'error', message: 'Message ID is required' };

    const message = await this.messageRepository.findById(data.messageId);
    if (!message) return { status: 'error', message: 'Message not found' };

    const result = message.softDelete();
    if (result.isFail) return { status: 'error', message: String(result.error) };

    await this.messageRepository.save(message);
    this.broadcastMessageDeleted(data.channelId, data.messageId);

    return { status: 'success', data: { id: data.messageId } };
  }

  @SubscribeMessage('message:pin')
  async handlePinMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: string; messageId: string },
  ) {
    const userId = this.connectedUsers.get(client.id)?.userId;
    if (!userId) return { status: 'error', message: 'Not authenticated' };
    if (!data.messageId) return { status: 'error', message: 'Message ID is required' };

    const message = await this.messageRepository.findById(data.messageId);
    if (!message) return { status: 'error', message: 'Message not found' };

    message.pin();
    await this.messageRepository.save(message);

    this.server.to(`channel:${data.channelId}`).emit('message:pinned', {
      id: data.messageId,
      channelId: data.channelId,
      isPinned: true,
    });
    return { status: 'success' };
  }

  @SubscribeMessage('message:unpin')
  async handleUnpinMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: string; messageId: string },
  ) {
    const userId = this.connectedUsers.get(client.id)?.userId;
    if (!userId) return { status: 'error', message: 'Not authenticated' };
    if (!data.messageId) return { status: 'error', message: 'Message ID is required' };

    const message = await this.messageRepository.findById(data.messageId);
    if (!message) return { status: 'error', message: 'Message not found' };

    message.unpin();
    await this.messageRepository.save(message);

    this.server.to(`channel:${data.channelId}`).emit('message:pinned', {
      id: data.messageId,
      channelId: data.channelId,
      isPinned: false,
    });
    return { status: 'success' };
  }

  @SubscribeMessage('reaction:add')
  async handleAddReaction(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: string; messageId: string; emoji: string },
  ) {
    console.log(`[ChatGateway] reaction:add received from ${client.id}:`, data);
    const userId = this.connectedUsers.get(client.id)?.userId || (client.handshake.query?.userId as string);
    if (!userId) {
      console.warn(`[ChatGateway] reaction:add rejected - Not authenticated for socket ${client.id}`);
      return { status: 'error', message: 'Not authenticated' };
    }
    if (!data.messageId) return { status: 'error', message: 'Message ID is required' };

    const result = await this.reactHandler.execute(
      new ReactToMessageCommand(data.messageId, userId, data.emoji)
    );
    if (result.isFail) {
      console.error(`[ChatGateway] reaction:add failed:`, result.error);
      return { status: 'error', message: String(result.error) };
    }

    const message = await this.messageRepository.findById(data.messageId);
    if (message) {
      this.broadcastReactionUpdated(
        data.channelId,
        data.messageId,
        message.reactions.map((r) => ({ userId: r.userId, emoji: r.emoji })),
      );
    }
    return { status: 'success' };
  }

  @SubscribeMessage('reaction:remove')
  async handleRemoveReaction(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: string; messageId: string; emoji: string },
  ) {
    const userId = this.connectedUsers.get(client.id)?.userId || (client.handshake.query?.userId as string);
    if (!userId) return { status: 'error', message: 'Not authenticated' };
    if (!data.messageId) return { status: 'error', message: 'Message ID is required' };

    const message = await this.messageRepository.findById(data.messageId);
    if (!message) return { status: 'error', message: 'Message not found' };

    message.removeReaction(userId, data.emoji);
    await this.messageRepository.save(message);

    this.broadcastReactionUpdated(
      data.channelId,
      data.messageId,
      message.reactions.map((r) => ({ userId: r.userId, emoji: r.emoji })),
    );
    return { status: 'success' };
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: TypingPayload,
  ) {
    client.to(`channel:${data.channelId}`).emit('typing:update', {
      userId: data.userId,
      userName: data.userName,
      isTyping: true,
    });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: TypingPayload,
  ) {
    client.to(`channel:${data.channelId}`).emit('typing:update', {
      userId: data.userId,
      userName: data.userName,
      isTyping: false,
    });
  }

  @SubscribeMessage('thread:read')
  async handleThreadRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { threadId: string },
  ) {
    const userId = this.connectedUsers.get(client.id)?.userId || (client.handshake.query?.userId as string);
    if (!userId || !data.threadId) return { status: 'error' };

    await this.messageRepository.markThreadAsRead(data.threadId, userId);
    return { status: 'success' };
  }

  // ── Broadcast Helpers ──

  broadcastMessageEdited(channelId: string, messageId: string, content: string, editedAt: string) {
    this.server.to(`channel:${channelId}`).emit('message:edited', {
      id: messageId,
      channelId,
      content,
      isEdited: true,
      editedAt,
    });
  }

  broadcastMessageDeleted(channelId: string, messageId: string) {
    this.server.to(`channel:${channelId}`).emit('message:deleted', {
      id: messageId,
      channelId,
    });
  }

  broadcastReactionUpdated(channelId: string, messageId: string, reactions: { userId: string; emoji: string }[]) {
    this.server.to(`channel:${channelId}`).emit('reaction:updated', {
      messageId,
      channelId,
      reactions,
    });
  }

  broadcastWorkspaceArchived(workspaceId: string) {
    this.server.to(`workspace:${workspaceId}`).emit('workspace:archived', {
      workspaceId,
    });
  }

  broadcastWorkspaceMemberRemoved(workspaceId: string, userId: string) {
    this.server.to(`workspace:${workspaceId}`).emit('workspace:member_removed', {
      workspaceId,
      userId,
    });
  }
}
