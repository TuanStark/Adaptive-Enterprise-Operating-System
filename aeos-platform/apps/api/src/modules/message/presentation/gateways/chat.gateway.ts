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
  handleJoinChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: string },
  ) {
    if (data?.channelId) {
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

  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: string; content: string; parentMessageId?: string },
  ) {
    const userId = this.connectedUsers.get(client.id)?.userId || (client.handshake.query?.userId as string);
    if (!userId) {
      console.warn(`[ChatGateway] Message reject: Not authenticated for socket ${client.id}`);
      return { event: 'error', data: { message: 'Not authenticated' } };
    }

    if (!data?.channelId || !data?.content) {
      return { event: 'error', data: { message: 'Channel ID and content are required' } };
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
      return { event: 'error', data: { message: String(result.error) } };
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
    this.server.to(`channel:${data.channelId}`).emit('message:received', messagePayload);
    client.emit('message:received', messagePayload);

    return { event: 'message:sent', data: { id: result.value } };
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
}
